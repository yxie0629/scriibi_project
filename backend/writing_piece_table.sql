CREATE TABLE IF NOT EXISTS writing_piece(
    `id` bigint unsigned NOT NULL AUTO_INCREMENT,
    `writing_task_student_id` bigint unsigned NOT NULL,
    `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    `created_at` timestamp NULL DEFAULT NULL,
    `updated_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY(id),
    CONSTRAINT`fk_writing_task_student_id` FOREIGN KEY(`writing_task_student_id`) REFERENCES`writing_task_student`(`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 338 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;