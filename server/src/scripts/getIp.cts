import { Request } from "express";

const getIp = (req: Request) => (req.headers["x-forwarded-for"] || req.connection.remoteAddress)?.toString();

export default getIp;