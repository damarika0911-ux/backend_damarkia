const aliases: Record<string, string> = {
  tiruvallur: "Thiruvallur", thiruvallur: "Thiruvallur",
  tiruvarur: "Thiruvarur", thiruvarur: "Thiruvarur",
  thoothukudi: "Thoothukkudi", thoothukkudi: "Thoothukkudi",
  kanniyakumari: "Kanyakumari", kanyakumari: "Kanyakumari",
  tiruchirapalli: "Tiruchirappalli", tiruchirappalli: "Tiruchirappalli",
};
export const districtName = (name: string) => aliases[name.trim().toLowerCase()] || name.trim();
