// Punto de entrada del módulo users.
// La creación del service vive en la factory (fuente única de ensamblaje).
export { createUserService } from "@/modules/users/factories/create-user-service";
export { UserService, UserServiceError } from "@/modules/users/user.service";
export { UserRepository } from "@/modules/users/repository";