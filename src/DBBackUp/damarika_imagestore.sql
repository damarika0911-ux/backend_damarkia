-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 05, 2026 at 03:19 PM
-- Server version: 10.11.13-MariaDB-cll-lve
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `damarika_imagestore`
--

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `images`
--

INSERT INTO `images` (`id`, `name`, `image_url`, `file_path`, `filename`) VALUES
(120, 'WhatsApp Image 2025-04-04 at 15.30.41.jpeg', 'https://images.damarika.in/uploads/fb5b2da19b6bed5f676b.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/fb5b2da19b6bed5f676b.jpeg', 'fb5b2da19b6bed5f676b.jpeg'),
(135, 'WhatsApp Image 2025-04-04 at 15.31.05.jpeg', 'https://images.damarika.in/uploads/c72bd3c0872a340bacff.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/c72bd3c0872a340bacff.jpeg', 'c72bd3c0872a340bacff.jpeg'),
(144, 'logo.png', 'https://images.damarika.in/uploads/cdbeedcf9364409a9d59.png', '/home4/damarika/public_html/images.damarika.in/uploads/cdbeedcf9364409a9d59.png', 'cdbeedcf9364409a9d59.png'),
(151, 'Mamallapuram.jpg', 'https://images.damarika.in/uploads/a5a63d3ac902f2609a1f.jpg', '/home4/damarika/public_html/images.damarika.in/uploads/a5a63d3ac902f2609a1f.jpg', 'a5a63d3ac902f2609a1f.jpg'),
(156, 'adichanallur.jpg', 'https://images.damarika.in/uploads/d351b71d0bdfe79c7bcc.jpg', '/home4/damarika/public_html/images.damarika.in/uploads/d351b71d0bdfe79c7bcc.jpg', 'd351b71d0bdfe79c7bcc.jpg'),
(157, 'Thanjavur.jpg', 'https://images.damarika.in/uploads/c624c006fa190ae36e57.jpg', '/home4/damarika/public_html/images.damarika.in/uploads/c624c006fa190ae36e57.jpg', 'c624c006fa190ae36e57.jpg'),
(159, 'Temple_de_Mînâkshî01.jpg', 'https://images.damarika.in/uploads/d12f582a380eb3131439.jpg', '/home4/damarika/public_html/images.damarika.in/uploads/d12f582a380eb3131439.jpg', 'd12f582a380eb3131439.jpg'),
(165, 'kanchi.jpg', 'https://images.damarika.in/uploads/e7b13d35e0a9a58aa481.jpg', '/home4/damarika/public_html/images.damarika.in/uploads/e7b13d35e0a9a58aa481.jpg', 'e7b13d35e0a9a58aa481.jpg'),
(166, 'images (2).jpg', 'https://images.damarika.in/uploads/be29d6d9c2290456fae9.jpg', '/home4/damarika/public_html/images.damarika.in/uploads/be29d6d9c2290456fae9.jpg', 'be29d6d9c2290456fae9.jpg'),
(168, 'images (3).jpg', 'https://images.damarika.in/uploads/9db4b10604b00909700c.jpg', '/home4/damarika/public_html/images.damarika.in/uploads/9db4b10604b00909700c.jpg', '9db4b10604b00909700c.jpg'),
(173, 'WhatsApp Image 2025-04-04 at 3.31.05 PM.jpeg', 'https://images.damarika.in/uploads/f96f49d8cf069043fca3.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/f96f49d8cf069043fca3.jpeg', 'f96f49d8cf069043fca3.jpeg'),
(177, 'WhatsApp Image 2025-04-04 at 3.28.06 PM.jpeg', 'https://images.damarika.in/uploads/6793ca6763f8e2b9630d.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/6793ca6763f8e2b9630d.jpeg', '6793ca6763f8e2b9630d.jpeg'),
(178, 'New 3_0.jpg', 'https://images.damarika.in/uploads/998266ea7dcc241fb84f.jpg', '/home4/damarika/public_html/images.damarika.in/uploads/998266ea7dcc241fb84f.jpg', '998266ea7dcc241fb84f.jpg'),
(180, 'WhatsApp Image 2025-04-04 at 4.32.03 PM.jpeg', 'https://images.damarika.in/uploads/a56f822aa5a70fa60f2a.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/a56f822aa5a70fa60f2a.jpeg', 'a56f822aa5a70fa60f2a.jpeg'),
(181, 'WhatsApp Image 2025-04-04 at 3.28.06 PM.jpeg', 'https://images.damarika.in/uploads/562444a21ff76c4ce47f.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/562444a21ff76c4ce47f.jpeg', '562444a21ff76c4ce47f.jpeg'),
(185, 'WhatsApp Image 2025-04-04 at 4.32.03 PM.jpeg', 'https://images.damarika.in/uploads/9ab3eac5361ac33fa3c4.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/9ab3eac5361ac33fa3c4.jpeg', '9ab3eac5361ac33fa3c4.jpeg'),
(186, 'WhatsApp Image 2025-04-04 at 7.24.24 PM.jpeg', 'https://images.damarika.in/uploads/c07e7f2e88d9fe2d62bb.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/c07e7f2e88d9fe2d62bb.jpeg', 'c07e7f2e88d9fe2d62bb.jpeg'),
(187, 'WhatsApp Image 2025-04-04 at 4.32.03 PM.jpeg', 'https://images.damarika.in/uploads/39de70e8b0aaac13973c.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/39de70e8b0aaac13973c.jpeg', '39de70e8b0aaac13973c.jpeg'),
(188, 'WhatsApp Image 2025-04-04 at 3.28.05 PM.jpeg', 'https://images.damarika.in/uploads/489d4b768cf48e9b3b8f.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/489d4b768cf48e9b3b8f.jpeg', '489d4b768cf48e9b3b8f.jpeg'),
(189, 'WhatsApp Image 2025-04-04 at 15.30.41.jpeg', 'https://images.damarika.in/uploads/b392419dff49a6fbf96e.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/b392419dff49a6fbf96e.jpeg', 'b392419dff49a6fbf96e.jpeg'),
(191, 'WhatsApp Image 2025-04-04 at 3.28.05 PM.jpeg', 'https://images.damarika.in/uploads/59a8efb1f07ee0bbdece.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/59a8efb1f07ee0bbdece.jpeg', '59a8efb1f07ee0bbdece.jpeg'),
(192, 'WhatsApp Image 2025-04-04 at 4.32.03 PM.jpeg', 'https://images.damarika.in/uploads/9ac2081be1c3412a3ece.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/9ac2081be1c3412a3ece.jpeg', '9ac2081be1c3412a3ece.jpeg'),
(193, 'WhatsApp Image 2025-04-04 at 3.28.05 PM.jpeg', 'https://images.damarika.in/uploads/5751ba7e857409185449.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/5751ba7e857409185449.jpeg', '5751ba7e857409185449.jpeg'),
(194, 'WhatsApp Image 2025-04-04 at 3.31.05 PM.jpeg', 'https://images.damarika.in/uploads/451fe6becb49547e5e09.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/451fe6becb49547e5e09.jpeg', '451fe6becb49547e5e09.jpeg'),
(195, 'WhatsApp Image 2025-04-04 at 7.24.24 PM.jpeg', 'https://images.damarika.in/uploads/05ed3a90419a84a932a8.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/05ed3a90419a84a932a8.jpeg', '05ed3a90419a84a932a8.jpeg'),
(196, 'WhatsApp Image 2025-04-04 at 3.31.05 PM.jpeg', 'https://images.damarika.in/uploads/9a9ea495a8be16a1d904.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/9a9ea495a8be16a1d904.jpeg', '9a9ea495a8be16a1d904.jpeg'),
(197, 'WhatsApp Image 2025-04-04 at 3.28.06 PM.jpeg', 'https://images.damarika.in/uploads/f9d46a2067df825e8346.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/f9d46a2067df825e8346.jpeg', 'f9d46a2067df825e8346.jpeg'),
(200, 'WhatsApp Image 2025-04-04 at 4.32.03 PM.jpeg', 'https://images.damarika.in/uploads/4e22029de41d88807c5c.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/4e22029de41d88807c5c.jpeg', '4e22029de41d88807c5c.jpeg'),
(201, 'WhatsApp Image 2025-04-04 at 3.28.05 PM.jpeg', 'https://images.damarika.in/uploads/580f254569cd875bb03d.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/580f254569cd875bb03d.jpeg', '580f254569cd875bb03d.jpeg'),
(202, 'WhatsApp Image 2025-04-04 at 7.24.24 PM.jpeg', 'https://images.damarika.in/uploads/8cdac7a428c13d8764a4.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/8cdac7a428c13d8764a4.jpeg', '8cdac7a428c13d8764a4.jpeg'),
(203, 'WhatsApp Image 2025-04-04 at 3.28.05 PM.jpeg', 'https://images.damarika.in/uploads/6bfd4007c2f62d8251e3.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/6bfd4007c2f62d8251e3.jpeg', '6bfd4007c2f62d8251e3.jpeg'),
(204, 'WhatsApp Image 2025-04-04 at 4.32.03 PM.jpeg', 'https://images.damarika.in/uploads/6af8c67b20045663e6eb.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/6af8c67b20045663e6eb.jpeg', '6af8c67b20045663e6eb.jpeg'),
(205, 'WhatsApp Image 2025-04-04 at 3.31.05 PM.jpeg', 'https://images.damarika.in/uploads/c53e6471c9e34d900015.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/c53e6471c9e34d900015.jpeg', 'c53e6471c9e34d900015.jpeg'),
(206, 'WhatsApp Image 2025-04-04 at 4.32.03 PM.jpeg', 'https://images.damarika.in/uploads/d4ea528dc78a2d3567d4.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/d4ea528dc78a2d3567d4.jpeg', 'd4ea528dc78a2d3567d4.jpeg'),
(207, 'WhatsApp Image 2025-04-04 at 4.32.03 PM.jpeg', 'https://images.damarika.in/uploads/168d610afa0b7bd05510.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/168d610afa0b7bd05510.jpeg', '168d610afa0b7bd05510.jpeg'),
(208, 'WhatsApp Image 2025-04-04 at 3.31.05 PM.jpeg', 'https://images.damarika.in/uploads/3a8dd1d7a6a9fcaad04d.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/3a8dd1d7a6a9fcaad04d.jpeg', '3a8dd1d7a6a9fcaad04d.jpeg'),
(209, 'WhatsApp Image 2025-04-04 at 3.28.05 PM.jpeg', 'https://images.damarika.in/uploads/86e065c9109b192955f3.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/86e065c9109b192955f3.jpeg', '86e065c9109b192955f3.jpeg'),
(210, 'WhatsApp Image 2025-04-04 at 4.32.03 PM.jpeg', 'https://images.damarika.in/uploads/0a5848b71a282f217a4e.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/0a5848b71a282f217a4e.jpeg', '0a5848b71a282f217a4e.jpeg'),
(211, 'WhatsApp Image 2025-04-04 at 4.32.03 PM.jpeg', 'https://images.damarika.in/uploads/ed214e702c7f805cd8a2.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/ed214e702c7f805cd8a2.jpeg', 'ed214e702c7f805cd8a2.jpeg'),
(212, 'WhatsApp Image 2025-04-04 at 7.24.24 PM.jpeg', 'https://images.damarika.in/uploads/9421e235de8bff6f29df.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/9421e235de8bff6f29df.jpeg', '9421e235de8bff6f29df.jpeg'),
(213, 'WhatsApp Image 2025-04-04 at 4.32.03 PM.jpeg', 'https://images.damarika.in/uploads/aa8c1eb8e64040d434a8.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/aa8c1eb8e64040d434a8.jpeg', 'aa8c1eb8e64040d434a8.jpeg'),
(214, 'WhatsApp Image 2025-04-04 at 3.28.06 PM.jpeg', 'https://images.damarika.in/uploads/65df8365b44195439320.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/65df8365b44195439320.jpeg', '65df8365b44195439320.jpeg'),
(215, 'WhatsApp Image 2025-04-04 at 3.28.05 PM.jpeg', 'https://images.damarika.in/uploads/41efffda1d2a1c68e6b9.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/41efffda1d2a1c68e6b9.jpeg', '41efffda1d2a1c68e6b9.jpeg'),
(224, 'WhatsApp Image 2025-04-04 at 3.08.31 PM.jpeg', 'https://images.damarika.in/uploads/4eabbdd8e6785a64b152.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/4eabbdd8e6785a64b152.jpeg', '4eabbdd8e6785a64b152.jpeg'),
(225, 'WhatsApp Image 2025-04-04 at 3.28.05 PM.jpeg', 'https://images.damarika.in/uploads/7ab782a7ed9a22e059c6.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/7ab782a7ed9a22e059c6.jpeg', '7ab782a7ed9a22e059c6.jpeg'),
(226, 'WhatsApp Image 2025-04-04 at 3.30.18 PM.jpeg', 'https://images.damarika.in/uploads/3ab30cd10969702925dc.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/3ab30cd10969702925dc.jpeg', '3ab30cd10969702925dc.jpeg'),
(227, 'WhatsApp Image 2025-04-04 at 3.31.05 PM.jpeg', 'https://images.damarika.in/uploads/f86a45f8456abeac4739.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/f86a45f8456abeac4739.jpeg', 'f86a45f8456abeac4739.jpeg'),
(231, '3ab30cd10969702925dc.jpeg', 'https://images.damarika.in/uploads/e1f5456b40f192f16334.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/e1f5456b40f192f16334.jpeg', 'e1f5456b40f192f16334.jpeg'),
(233, '9421e235de8bff6f29df.jpeg', 'https://images.damarika.in/uploads/1712585ce0698fdf7569.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/1712585ce0698fdf7569.jpeg', '1712585ce0698fdf7569.jpeg'),
(234, 'c53e6471c9e34d900015.jpeg', 'https://images.damarika.in/uploads/d35ac7413ba7f127c54b.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/d35ac7413ba7f127c54b.jpeg', 'd35ac7413ba7f127c54b.jpeg'),
(248, 'Epigraphy.avif', 'https://images.damarika.in/uploads/ae7a7621ecc894691c58.avif', '/home4/damarika/public_html/images.damarika.in/uploads/ae7a7621ecc894691c58.avif', 'ae7a7621ecc894691c58.avif'),
(255, 'Epigraphy.avif', 'https://images.damarika.in/uploads/b714e3d0ffbe46de75ae.avif', '/home4/damarika/public_html/images.damarika.in/uploads/b714e3d0ffbe46de75ae.avif', 'b714e3d0ffbe46de75ae.avif'),
(258, 'Madhumitha-FI.jpg', 'https://images.damarika.in/uploads/cc404fce02b000720eab.jpg', '/home4/damarika/public_html/images.damarika.in/uploads/cc404fce02b000720eab.jpg', 'cc404fce02b000720eab.jpg'),
(262, 'logo.png', 'https://images.damarika.in/uploads/a159e964cc72faf711e1.png', '/home4/damarika/public_html/images.damarika.in/uploads/a159e964cc72faf711e1.png', 'a159e964cc72faf711e1.png'),
(283, 'WhatsApp Image 2025-04-21 at 11.27.08 PM.jpeg', 'https://images.damarika.in/uploads/cba4f4fb936cc96fca35.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/cba4f4fb936cc96fca35.jpeg', 'cba4f4fb936cc96fca35.jpeg'),
(309, 'Damarika Archaeological Training Agency Pvt. Ltd. (2).png', 'https://images.damarika.in/uploads/9ab738f60778a9d2ce59.png', '/home4/damarika/public_html/images.damarika.in/uploads/9ab738f60778a9d2ce59.png', '9ab738f60778a9d2ce59.png'),
(310, 'Damarika Archaeological Training Agency Pvt. Ltd. (1).png', 'https://images.damarika.in/uploads/9fdab6c5d4badd35c64c.png', '/home4/damarika/public_html/images.damarika.in/uploads/9fdab6c5d4badd35c64c.png', '9fdab6c5d4badd35c64c.png'),
(312, 'Damarika Archaeological Training Agency Pvt. Ltd..png', 'https://images.damarika.in/uploads/064451bb57eb385092b1.png', '/home4/damarika/public_html/images.damarika.in/uploads/064451bb57eb385092b1.png', '064451bb57eb385092b1.png'),
(313, 'Damarika Archaeological Training Agency Pvt. Ltd. (2).png', 'https://images.damarika.in/uploads/3ef830e9e036ccc6c06a.png', '/home4/damarika/public_html/images.damarika.in/uploads/3ef830e9e036ccc6c06a.png', '3ef830e9e036ccc6c06a.png'),
(314, 'Damarika Archaeological Training Agency Pvt. Ltd. (1).png', 'https://images.damarika.in/uploads/e946aa76ebfc06be5d30.png', '/home4/damarika/public_html/images.damarika.in/uploads/e946aa76ebfc06be5d30.png', 'e946aa76ebfc06be5d30.png'),
(315, 'WhatsApp Image 2025-05-07 at 10.52.19 PM (2).jpeg', 'https://images.damarika.in/uploads/c086fc34f10b4f85a9b7.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/c086fc34f10b4f85a9b7.jpeg', 'c086fc34f10b4f85a9b7.jpeg'),
(316, 'WhatsApp Image 2025-04-04 at 15.30.41.jpeg', 'https://images.damarika.in/uploads/5882e3c19737d47cf4ac.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/5882e3c19737d47cf4ac.jpeg', '5882e3c19737d47cf4ac.jpeg'),
(317, 'WhatsApp Image 2025-04-20 at 4.20.16 PM.jpeg', 'https://images.damarika.in/uploads/4defe8893ac4ba23382e.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/4defe8893ac4ba23382e.jpeg', '4defe8893ac4ba23382e.jpeg'),
(318, 'WhatsApp Image 2025-04-20 at 4.22.01 PM.jpeg', 'https://images.damarika.in/uploads/15e9d87afc13a1d4ff3f.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/15e9d87afc13a1d4ff3f.jpeg', '15e9d87afc13a1d4ff3f.jpeg'),
(330, 'WhatsApp Image 2025-04-20 at 4.22.01 PM.jpeg', 'https://images.damarika.in/uploads/aa1e97eedae44fdbf8c1.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/aa1e97eedae44fdbf8c1.jpeg', 'aa1e97eedae44fdbf8c1.jpeg'),
(331, 'WhatsApp Image 2025-04-20 at 4.20.16 PM.jpeg', 'https://images.damarika.in/uploads/cab8db8349ea4522576b.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/cab8db8349ea4522576b.jpeg', 'cab8db8349ea4522576b.jpeg'),
(332, 'WhatsApp Image 2025-04-20 at 4.19.32 PM.jpeg', 'https://images.damarika.in/uploads/5578af73ce9a20e8b057.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/5578af73ce9a20e8b057.jpeg', '5578af73ce9a20e8b057.jpeg'),
(333, 'WhatsApp Image 2025-04-20 at 4.20.16 PM.jpeg', 'https://images.damarika.in/uploads/e79ae2d7a05c224edb30.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/e79ae2d7a05c224edb30.jpeg', 'e79ae2d7a05c224edb30.jpeg'),
(334, 'WhatsApp Image 2025-04-20 at 4.19.32 PM.jpeg', 'https://images.damarika.in/uploads/cc51438eee9c11ccb88c.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/cc51438eee9c11ccb88c.jpeg', 'cc51438eee9c11ccb88c.jpeg'),
(335, 'WhatsApp Image 2025-04-20 at 4.22.01 PM.jpeg', 'https://images.damarika.in/uploads/aa04b0afe8d2f2be4f6b.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/aa04b0afe8d2f2be4f6b.jpeg', 'aa04b0afe8d2f2be4f6b.jpeg'),
(336, 'Damarika Archaeological Training Agency Pvt. Ltd..png', 'https://images.damarika.in/uploads/fa6d663c12b4e45f58d8.png', '/home4/damarika/public_html/images.damarika.in/uploads/fa6d663c12b4e45f58d8.png', 'fa6d663c12b4e45f58d8.png'),
(337, 'WhatsApp Image 2025-05-07 at 10.52.19 PM (2).jpeg', 'https://images.damarika.in/uploads/3394e16a53e1e31dcf7c.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/3394e16a53e1e31dcf7c.jpeg', '3394e16a53e1e31dcf7c.jpeg'),
(338, 'Damarika Archaeological Training Agency Pvt. Ltd. (2).png', 'https://images.damarika.in/uploads/b1ceab05a4c3f321354b.png', '/home4/damarika/public_html/images.damarika.in/uploads/b1ceab05a4c3f321354b.png', 'b1ceab05a4c3f321354b.png'),
(339, 'Damarika Archaeological Training Agency Pvt. Ltd. (1).png', 'https://images.damarika.in/uploads/be9aa6854a7c19bbd650.png', '/home4/damarika/public_html/images.damarika.in/uploads/be9aa6854a7c19bbd650.png', 'be9aa6854a7c19bbd650.png'),
(340, 'WhatsApp Image 2025-05-07 at 10.52.19 PM (1).jpeg', 'https://images.damarika.in/uploads/3b2308289126a39f2eff.jpeg', '/home4/damarika/public_html/images.damarika.in/uploads/3b2308289126a39f2eff.jpeg', '3b2308289126a39f2eff.jpeg'),
(341, 'DAMARIKA FIN 1.jpg', 'https://images.damarika.in/uploads/3c3bd9f50d93d9711234.jpg', '/home4/damarika/public_html/images.damarika.in/uploads/3c3bd9f50d93d9711234.jpg', '3c3bd9f50d93d9711234.jpg'),
(342, 'ChatGPT Image Aug 27, 2025, 07_58_29 AM.png', 'https://images.damarika.in/uploads/4fe0357df10eb37a8262.png', '/home4/damarika/public_html/images.damarika.in/uploads/4fe0357df10eb37a8262.png', '4fe0357df10eb37a8262.png'),
(343, 'epigraphy poster (4).png', 'https://images.damarika.in/uploads/f9d7564e1624257e766d.png', '/home4/damarika/public_html/images.damarika.in/uploads/f9d7564e1624257e766d.png', 'f9d7564e1624257e766d.png'),
(344, 'epigraphy poster (4).png', 'https://images.damarika.in/uploads/cfd61c015166168d5495.png', '/home4/damarika/public_html/images.damarika.in/uploads/cfd61c015166168d5495.png', 'cfd61c015166168d5495.png'),
(345, 'Introduction to Archaeology course form (4).png', 'https://images.damarika.in/uploads/4195a54dbde55af99a56.png', '/home4/damarika/public_html/images.damarika.in/uploads/4195a54dbde55af99a56.png', '4195a54dbde55af99a56.png'),
(346, 'Introduction to Archaeology course form (4).png', 'https://images.damarika.in/uploads/08b6f1dfd9f84d7f9a08.png', '/home4/damarika/public_html/images.damarika.in/uploads/08b6f1dfd9f84d7f9a08.png', '08b6f1dfd9f84d7f9a08.png'),
(347, 'Introduction to Archaeology course form (4).png', 'https://images.damarika.in/uploads/ddb8cb3070f5359f24a1.png', '/home4/damarika/public_html/images.damarika.in/uploads/ddb8cb3070f5359f24a1.png', 'ddb8cb3070f5359f24a1.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=348;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
