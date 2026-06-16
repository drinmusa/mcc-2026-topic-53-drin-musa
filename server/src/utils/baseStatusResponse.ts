// interfaces
import { StatusCodeEnums } from '../interfaces/enums/index';

export const baseStatusResponse = {
    statusCode: StatusCodeEnums.OK,
    statusIsOk: true,
    statusMessage: '',
    statusPath: ''
};
