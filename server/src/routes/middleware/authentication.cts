import { Request, Response, NextFunction } from "express";
import UserModel from "../../models/user.model.cjs";

const isAuth = (req: Request, res: Response, next: NextFunction) => auth(req, res, next, ["user", "Admin"]);
const isAdmin = (req: Request, res: Response, next: NextFunction) => auth(req, res, next, ["Admin"]);

type statusT = "user" | "Admin";

const auth = (req: Request, res: Response, next: NextFunction, status: statusT[]) => {
    const { authentication, username } = req.body;

    UserModel.findOne({ username })
    .then(doc => {
        if(doc === null || doc.hashId !== authentication){
            res.send({ success: false, status: "401 Unauthorized" });
        }
        else if(!status.includes(doc.status)){
            res.send({ success: false, status: "403 Forbidden"});
        }
        else {
            next();
        }
    })
}

export { isAuth, isAdmin };