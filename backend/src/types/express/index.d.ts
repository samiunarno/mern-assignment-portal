import { IUser } from '../../models/user.model';

// This file augments the global Express namespace to add the `user` property to the Request object.
declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}
