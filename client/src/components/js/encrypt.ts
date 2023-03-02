// @ts-ignore
import bcrypt from 'bcryptjs'

const encrypt = (arg: string): string => {
  const hashedPassword = bcrypt.hashSync(arg, '$2a$10$CwTycUXWue0Thq9StjUM0u');
  return hashedPassword;
};

export default encrypt;
