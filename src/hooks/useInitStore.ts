import _ from "lodash";
const e = <T>(prefixObj: T): T => {
    const obj = _.cloneDeep(prefixObj);
    return obj;
};
export default e;

