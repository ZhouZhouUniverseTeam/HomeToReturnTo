import { requestWithoutToken } from "../utils/request";
export function getUserAgeDistributeData() {
  return requestWithoutToken("/users/userAgeDistribute", "get");
}
