// models
import UserDBModel from '../models/UserDB.model';

// interfaces
import { UserModel } from '../interfaces/models';
import { StatusCodeEnums } from '../interfaces/enums';

// utils
import { failure, ok, comparePassword, generateJWT } from '../utils';

export const LoginService = {
    login: async (data: Pick<UserModel, 'email' | 'password'>) => {
        try {
            const { email, password } = data;

            const user = await UserDBModel.query().findOne({ email: email });

            if (!user) return failure("This email doesn't exist!", StatusCodeEnums.EMAIL_NOT_FOUND);
            /**
             * Compares hashed password with the one from input
             */
            const passwordIsValid = await comparePassword(password, user.password);

            if (!passwordIsValid) return failure('Invalid Credentials', StatusCodeEnums.INVALID_CREDENTIALS);
            // Generate JWT with user data
            return ok({
                token: generateJWT({
                    id: user.id,
                    name: user.name,
                    email: user.email
                }),
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (error) {
            return failure({ 'Something went wrong': error });
        }
    }
};
