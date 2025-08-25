import { validate } from "uuid";
import { InvalidUUIDError } from "./core/errors/InvalidUUID.error";

export function validateUuid(id: string) {
    if (!validate(id)) {
        throw new InvalidUUIDError()
    }
}