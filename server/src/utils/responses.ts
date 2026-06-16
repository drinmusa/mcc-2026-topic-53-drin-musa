// interfaces
import { ResponseModel } from '../interfaces/models/index';
import { StatusCodeEnums } from '../interfaces/enums/index';

// baseStatusResponse
import { baseStatusResponse } from './baseStatusResponse';

export const ok = (data: object, httpCode = 200): ResponseModel => ({
    data: { ...baseStatusResponse, ...data },
    httpCode
});

export const failure = (
    data: object | string,
    statusCode: StatusCodeEnums = StatusCodeEnums.UNEXPECTED,
    httpCode = 200
): ResponseModel => ({
    data: {
        ...baseStatusResponse,
        statusCode,
        statusIsOk: false,
        ...(typeof data === 'string' ? { statusMessage: data } : data)
    },
    httpCode
});
