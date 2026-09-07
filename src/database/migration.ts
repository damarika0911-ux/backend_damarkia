import fs from "node:fs/promises";
import path from "node:path";
import logger from "../utils/logger";
import { promisePool } from "./connection";
import { districtName } from "./districtNames";
import districtSeed from "./districtSeed.json";

export const tables: string[] = [];

export async function runMigrations(): Promise<void> {
    const schemaPath = path.resolve(process.cwd(), "supabase/schema.sql");
    const schema = await fs.readFile(schemaPath, "utf8");
    const statements = schema.split(/;\s*(?:\r?\n|$)/).map((statement) => statement.replace(/--.*$/gm, "").trim()).filter(Boolean);

    for (const statement of statements) {
        try {
            await promisePool.query(statement);
        } catch (error: any) {
            if (/policy .* already exists/i.test(error.message)) continue;
            throw error;
        }
    }

    for (const rename of [
        "ALTER TABLE users RENAME COLUMN userverify TO user_verify",
        "ALTER TABLE users RENAME COLUMN lasttoken TO last_token",
    ]) {
        try { await promisePool.query(rename); } catch (error: any) {
            if (error?.code !== "42701" && error?.code !== "42703") throw error;
        }
    }

    for (const [name, centerX, centerY, pathData] of districtSeed as [string, number, number, string][]) {
        const [rows] = await promisePool.query<any[]>("SELECT id,name FROM district");
        const existing = rows.find((row) => districtName(row.name) === districtName(name));
        if (existing) {
            await promisePool.query("UPDATE district SET path=?, centerx=?, centery=? WHERE id=? AND (path IS NULL OR path='')", [pathData, centerX, centerY, existing.id]);
        } else {
            await promisePool.query("INSERT INTO district (name,path,centerx,centery,status) VALUES (?,?,?,?,true)", [name, pathData, centerX, centerY]);
        }
    }

    const [adminRows] = await promisePool.query<any[]>("SELECT id FROM users WHERE email=? LIMIT 1", ["admin@damarika.in"]);
    const adminId = adminRows[0]?.id || null;
    const [adminRoleRows] = await promisePool.query<any[]>("SELECT id FROM roles WHERE role_name=? LIMIT 1", ["admin"]);
    const adminRoleId = adminRoleRows[0]?.id || null;
    const [districtRows] = await promisePool.query<any[]>("SELECT id FROM district ORDER BY id ASC LIMIT 1");
    const districtId = districtRows[0]?.id || null;

    async function seed(table: string, keyColumn: string, keyValue: string, sql: string, values: unknown[]) {
        const [existing] = await promisePool.query<any[]>(`SELECT id FROM ${table} WHERE ${keyColumn}=? LIMIT 1`, [keyValue]);
        if (!existing.length) await promisePool.query(sql, values);
    }

    await seed("product_categories", "title", "Excavation Tools",
        "INSERT INTO product_categories (title,description,status,created_by,updated_by) VALUES (?,?,true,?,?)",
        ["Excavation Tools", "Professional tools for archaeological fieldwork and site documentation.", adminId, adminId]);
    await seed("product_categories", "title", "Artifact Preservation",
        "INSERT INTO product_categories (title,description,status,created_by,updated_by) VALUES (?,?,true,?,?)",
        ["Artifact Preservation", "Materials and equipment for safe artifact handling and preservation.", adminId, adminId]);

    const [categoryRows] = await promisePool.query<any[]>("SELECT id FROM product_categories WHERE title=? LIMIT 1", ["Excavation Tools"]);
    const categoryId = categoryRows[0]?.id || null;
    await seed("products", "title", "Professional Archaeology Trowel",
        "INSERT INTO products (title,description,price,badge,link,categoryid,status,created_by,updated_by) VALUES (?,?,?,?,?,?,true,?,?)",
        ["Professional Archaeology Trowel", "Stainless-steel trowel with a durable wooden handle for precise excavation.", 1200, "Best Seller", "https://wa.me/917418859886", categoryId, adminId, adminId]);
    await seed("products", "title", "Precision Brush Set",
        "INSERT INTO products (title,description,price,badge,link,categoryid,status,created_by,updated_by) VALUES (?,?,?,?,?,?,true,?,?)",
        ["Precision Brush Set", "A five-piece brush set for detailed cleaning and artifact documentation.", 850, "New", "https://wa.me/917418859886", categoryId, adminId, adminId]);

    await seed("program", "title", "Foundations of Archaeological Fieldwork",
        "INSERT INTO program (title,description,date,location,isfeatured,isupcoming,status,createdby,updatedby) VALUES (?,?,CURRENT_TIMESTAMP + INTERVAL '30 days',?,?,?,true,?,?)",
        ["Foundations of Archaeological Fieldwork", "A practical introduction to surveying, excavation recording, and responsible heritage practice.", "Chennai, Tamil Nadu", true, true, adminId, adminId]);
    await seed("program", "title", "Heritage Documentation Workshop",
        "INSERT INTO program (title,description,date,location,isfeatured,isupcoming,status,createdby,updatedby) VALUES (?,?,CURRENT_TIMESTAMP + INTERVAL '60 days',?,?,?,true,?,?)",
        ["Heritage Documentation Workshop", "Learn structured photography, cataloguing, and digital documentation for heritage sites.", "Madurai, Tamil Nadu", false, true, adminId, adminId]);

    await seed("peoples", "name", "Aakash A",
        "INSERT INTO peoples (name,title,description,mobile,email,status,role_id,created_by,updated_by) VALUES (?,?,?,?,?,true,?,?,?)",
        ["Aakash A", "Chief Executive Officer", "Leads heritage programmes and research partnerships with a focus on responsible archaeology.", "+91 90000 10001", "aakash@damarika.in", adminRoleId, adminId, adminId]);
    await seed("peoples", "name", "Gayathrre V S",
        "INSERT INTO peoples (name,title,description,mobile,email,status,role_id,created_by,updated_by) VALUES (?,?,?,?,?,true,?,?,?)",
        ["Gayathrre V S", "Managing Director", "Coordinates training programmes, field operations, and community heritage initiatives.", "+91 90000 10002", "gayathrre@damarika.in", adminRoleId, adminId, adminId]);

    await seed("archaeological_sites", "name", "Keeladi",
        "INSERT INTO archaeological_sites (name,type,description,period,districtid,status,created_by,updated_by) VALUES (?,?,?,?,?,true,?,?)",
        ["Keeladi", "cultural", "An important urban settlement of the Sangam period on the banks of the Vaigai River.", "6th century BCE - 1st century CE", districtId, adminId, adminId]);
    await seed("archaeological_sites", "name", "Mamallapuram",
        "INSERT INTO archaeological_sites (name,type,description,period,districtid,status,created_by,updated_by) VALUES (?,?,?,?,?,true,?,?)",
        ["Mamallapuram", "cultural", "A UNESCO World Heritage Site known for Pallava rock-cut monuments and temples.", "7th - 8th century CE", districtId, adminId, adminId]);

    await seed("contact_form", "sender_email", "visitor@example.com",
        "INSERT INTO contact_form (name,reciever_email,sender_email,subject,message,isreplied,status) VALUES (?,?,?,?,?,false,true)",
        ["Demo Visitor", "support@damarika.in", "visitor@example.com", "Heritage programme enquiry", "I would like to know more about the upcoming fieldwork programme."]);
    await seed("email_template", "name", "Contact Reply",
        "INSERT INTO email_template (name,subject,body,status) VALUES (?,?,?,true)",
        ["Contact Reply", "Thank you for contacting Damarika", "Hello {{name}},\n\nThank you for contacting Damarika. Our team will get back to you shortly.\n\nRegards,\nDamarika Team"]);

    const extraCategories = [
        ["Survey Equipment", "Reliable equipment for site surveys, mapping, and field measurement."],
        ["Field Documentation", "Notebooks, tags, and documentation supplies for archaeological teams."],
        ["Conservation Materials", "Archival materials for cleaning, packing, and protecting finds."],
        ["Safety Gear", "Practical protective equipment for safe field and laboratory work."],
        ["Photography Kits", "Lighting and photography accessories for heritage documentation."],
        ["Mapping Accessories", "Accessories for accurate site plans and archaeological mapping."],
        ["Research Supplies", "Everyday supplies for research, cataloguing, and analysis."],
        ["Storage Solutions", "Organised storage products for collections and field samples."],
    ];
    for (const [title, description] of extraCategories) await seed("product_categories", "title", title,
        "INSERT INTO product_categories (title,description,status,created_by,updated_by) VALUES (?,?,true,?,?)",
        [title, description, adminId, adminId]);

    const extraProducts: [string, string, number, string][] = [
        ["Digital Measuring Tape", "Compact measuring tape for quick field measurements.", 420, "Field Pick"],
        ["Waterproof Field Notebook", "Durable notebook for recording observations in the field.", 280, "Essential"],
        ["Artifact Label Pack", "Acid-free labels for cataloguing and collection management.", 190, "New"],
        ["LED Inspection Lamp", "Portable light for careful inspection of artifacts and surfaces.", 980, "Popular"],
        ["Protective Work Gloves", "Comfortable gloves for safe handling of archaeological material.", 350, "Safety"],
        ["Scale and Photo Board", "Standard reference board for consistent artifact photography.", 560, "Documentation"],
        ["Sample Storage Boxes", "Stackable archival boxes for organised sample storage.", 760, "Collection"],
        ["Compass and Field Ruler", "Basic navigation and scale tools for survey teams.", 640, "Field Pick"],
    ];
    for (const [title, description, price, badge] of extraProducts) await seed("products", "title", title,
        "INSERT INTO products (title,description,price,badge,link,categoryid,status,created_by,updated_by) VALUES (?,?,?,?,?,?,true,?,?)",
        [title, description, price, badge, "https://wa.me/917418859886", categoryId, adminId, adminId]);

    const extraPrograms: [string, string, string, boolean][] = [
        ["Archaeological Survey Methods", "Practice non-invasive survey methods and field note standards.", "Coimbatore, Tamil Nadu", false],
        ["Sangam History Seminar", "An accessible seminar on Sangam literature, trade, and material culture.", "Madurai, Tamil Nadu", true],
        ["Digital Heritage Basics", "Introduction to digital cataloguing and heritage information management.", "Chennai, Tamil Nadu", false],
        ["Artifact Care and Handling", "Learn safe handling, packing, and first-response conservation practices.", "Thanjavur, Tamil Nadu", false],
        ["Community Heritage Training", "A community-centred programme for recording local heritage stories.", "Salem, Tamil Nadu", true],
        ["Field Photography Practice", "Improve scale, light, and context in archaeological photography.", "Tiruchirappalli, Tamil Nadu", false],
        ["Introduction to Epigraphy", "Explore inscriptions, documentation methods, and historical context.", "Kanchipuram, Tamil Nadu", true],
        ["Collection Management Clinic", "Practical workflows for registering, storing, and tracking collections.", "Chennai, Tamil Nadu", false],
    ];
    for (const [title, description, location, featured] of extraPrograms) await seed("program", "title", title,
        "INSERT INTO program (title,description,date,location,isfeatured,isupcoming,status,createdby,updatedby) VALUES (?,?,CURRENT_TIMESTAMP + INTERVAL '90 days',?,?,true,true,?,?)",
        [title, description, location, featured, adminId, adminId]);

    const extraPeople: [string, string][] = [
        ["Vijay Bharath S", "Chief Financial Officer"], ["Madhumitha R", "Research Coordinator"],
        ["Arun Kumar", "Field Archaeologist"], ["Priya S", "Heritage Educator"],
        ["Karthik M", "Collections Manager"], ["Nandhini P", "Documentation Specialist"],
        ["Suresh B", "Survey Lead"], ["Meena V", "Community Programme Lead"],
    ];
    for (const [index, [name, title]] of extraPeople.entries()) await seed("peoples", "name", name,
        "INSERT INTO peoples (name,title,description,mobile,email,status,role_id,created_by,updated_by) VALUES (?,?,?,?,?,true,?,?,?)",
        [name, title, `${title} supporting Damarika's archaeology and heritage programmes.`, "+91 90000 10" + String(index + 10).padStart(2, "0"), `${String(name).toLowerCase().replace(/[^a-z]+/g, ".")}@damarika.in`, adminRoleId, adminId, adminId]);

    const extraSites = [
        ["Gangaikonda Cholapuram", "cultural", "A Chola-era capital known for its monumental temple and heritage landscape.", "11th century CE"],
        ["Adichanallur", "cultural", "An important Iron Age burial site with evidence of early craft and funerary traditions.", "1000 BCE - 600 BCE"],
        ["Thanjavur Brihadeeswarar Temple", "cultural", "A celebrated Chola temple and UNESCO World Heritage monument.", "10th - 11th century CE"],
        ["Poompuhar", "mixed", "An ancient port city remembered in Sangam literature and maritime history.", "300 BCE - 300 CE"],
        ["Madurai Heritage Quarter", "cultural", "A living urban heritage area shaped by temple, trade, and literary traditions.", "3rd century BCE - present"],
        ["Kodumanal", "cultural", "An ancient industrial and trade centre known for beads, iron, and craft production.", "5th century BCE - 1st century CE"],
        ["Gulf of Mannar", "natural", "A marine biosphere with a long history of coastal trade and cultural exchange.", "Various periods"],
        ["Kanchipuram Temple District", "cultural", "A historic city with major Pallava and later-period temple traditions.", "4th - 9th century CE"],
    ];
    for (const [name, type, description, period] of extraSites) await seed("archaeological_sites", "name", name,
        "INSERT INTO archaeological_sites (name,type,description,period,districtid,status,created_by,updated_by) VALUES (?,?,?,?,?,true,?,?)",
        [name, type, description, period, districtId, adminId, adminId]);

    const siteDistricts: Record<string, string> = {
        "Gangaikonda Cholapuram": "Ariyalur",
        "Adichanallur": "Thoothukkudi",
        "Thanjavur Brihadeeswarar Temple": "Thanjavur",
        "Poompuhar": "Mayiladuthurai",
        "Madurai Heritage Quarter": "Madurai",
        "Kodumanal": "Erode",
        "Gulf of Mannar": "Thoothukkudi",
        "Kanchipuram Temple District": "Kanchipuram",
    };
    for (const [siteName, district] of Object.entries(siteDistricts)) {
        await promisePool.query(
            `UPDATE archaeological_sites SET districtId=(SELECT id FROM district WHERE lower(name)=lower(?) LIMIT 1)
             WHERE name=? AND EXISTS (SELECT 1 FROM district WHERE lower(name)=lower(?))`,
            [district, siteName, district]
        );
    }

    const extraContacts = [
        ["researcher@example.com", "Research collaboration enquiry"], ["student@example.com", "Training programme question"],
        ["heritagegroup@example.com", "Community heritage partnership"], ["museum@example.com", "Collection documentation request"],
        ["teacher@example.com", "School heritage visit"], ["volunteer@example.com", "Volunteer opportunities"],
        ["visitor@example.com", "Site visit information"], ["partner@example.com", "Programme partnership proposal"],
    ];
    for (const [email, subject] of extraContacts) await seed("contact_form", "sender_email", email,
        "INSERT INTO contact_form (name,reciever_email,sender_email,subject,message,isreplied,status) VALUES (?,?,?,?,?,false,true)",
        ["Demo Enquirer", "support@damarika.in", email, subject, "This is sample contact data for the Damarika admin workflow."]);

    const extraTemplates = [
        ["Programme Enquiry", "We received your programme enquiry", "Hello {{name}},\n\nThank you for your interest in our programmes.\n\nRegards,\nDamarika Team"],
        ["Training Registration", "Training registration received", "Hello {{name}},\n\nWe received your training registration and will contact you soon.\n\nRegards,\nDamarika Team"],
        ["Site Visit Request", "Your site visit request", "Hello {{name}},\n\nYour site visit request has been received.\n\nRegards,\nDamarika Team"],
        ["Partnership Enquiry", "Thank you for your partnership enquiry", "Hello {{name}},\n\nOur partnerships team will review your enquiry.\n\nRegards,\nDamarika Team"],
        ["Volunteer Interest", "Thank you for volunteering", "Hello {{name}},\n\nThank you for your interest in supporting heritage work.\n\nRegards,\nDamarika Team"],
        ["Research Request", "Research request received", "Hello {{name}},\n\nWe received your research request and will follow up shortly.\n\nRegards,\nDamarika Team"],
        ["Feedback Received", "Thank you for your feedback", "Hello {{name}},\n\nThank you for helping us improve our work.\n\nRegards,\nDamarika Team"],
        ["General Enquiry", "Thank you for contacting Damarika", "Hello {{name}},\n\nThank you for contacting Damarika.\n\nRegards,\nDamarika Team"],
    ];
    for (const [name, subject, body] of extraTemplates) await seed("email_template", "name", name,
        "INSERT INTO email_template (name,subject,body,status) VALUES (?,?,?,true)", [name, subject, body]);

    const storageBase = process.env.SUPABASE_URL?.replace(/\/+$/, "") + "/storage/v1/object/public/uploads/";
    if (process.env.SUPABASE_URL) {
        await promisePool.query("UPDATE program SET image=? WHERE image IS NULL OR image=''", [storageBase + "tools.jpeg"]);
        await promisePool.query("UPDATE products SET image=? WHERE image IS NULL OR image=''", [storageBase + "tools.jpeg"]);
        await promisePool.query("UPDATE product_categories SET image=? WHERE image IS NULL OR image=''", [storageBase + "tools.jpeg"]);
        await promisePool.query("UPDATE peoples SET image=? WHERE image IS NULL OR image=''", [storageBase + "walpaper.png"]);
        await promisePool.query("UPDATE archaeological_sites SET image=? WHERE image IS NULL OR image=''", [storageBase + "walpaper.png"]);
    }

    logger.info(`Supabase schema verified, ${districtSeed.length} districts and up to 10 records seeded per content table`);
}
