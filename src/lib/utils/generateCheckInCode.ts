import { customAlphabet } from "nanoid";
import { CUSTOM_ALPHABET_CHECK_IN_CODE } from "../constants";

export const generateCheckInCode = () => {
  const checkInCode = customAlphabet(
    CUSTOM_ALPHABET_CHECK_IN_CODE.alphabet,
    CUSTOM_ALPHABET_CHECK_IN_CODE.size,
  );
  return checkInCode();
};
