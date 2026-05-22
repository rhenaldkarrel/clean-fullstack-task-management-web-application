CREATE DATABASE IF NOT EXISTS task_management;
CREATE DATABASE IF NOT EXISTS task_management_test;
CREATE DATABASE IF NOT EXISTS task_management_shadow;

GRANT ALL PRIVILEGES ON task_management.* TO 'task_user'@'%';
GRANT ALL PRIVILEGES ON task_management_test.* TO 'task_user'@'%';
GRANT ALL PRIVILEGES ON task_management_shadow.* TO 'task_user'@'%';

FLUSH PRIVILEGES;
