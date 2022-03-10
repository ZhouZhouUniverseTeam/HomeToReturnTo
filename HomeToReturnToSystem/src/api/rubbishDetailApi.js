import {requestWithoutToken} from "../utils/request";

export function getRubbishDetailData({rubbishType, page, pageSize}) {
    return requestWithoutToken('/rubbish/list','get', {rubbishType, page, pageSize})
}

export function getSearchData({rubbishType, page, pageSize, rubbishName}) {
    return requestWithoutToken('/rubbish/search','get', {rubbishType, page, pageSize, rubbishName})
}

export function getRubbishType(id) {
    return requestWithoutToken('/rubbish/rubbishType','get', {id})
}