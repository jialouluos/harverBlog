
interface I_Options {
    top?: number,
    left?: number;
    bottom?: number;
    right?: number;
}
interface I_check {
    top?: boolean;
    left?: boolean;
    bottom?: boolean;
    right?: boolean;
}
interface I_Opposite {
    top?: boolean;
    left?: boolean;
    bottom?: boolean;
    right?: boolean;
}
/**optionParams∈0~1 */
export default (element: HTMLElement, checkOption?: I_check, option?: I_Options, oppOption?: I_Opposite) => {
    const { top: pretop = 0, left: preleft = 0, bottom: prebottom = 1, right: preright = 1 } = option || {};
    const { top: topCheck = false, left: leftCheck = false, bottom: bottomCheck = false, right: rightCheck = false } = checkOption || {};
    const { top: rtop = false, left: rleft = false, bottom: rbottom = false, right: rright = false } = oppOption || {};
    const viewWidth =
        window.innerWidth || document.documentElement.clientWidth;
    const viewHeight =
        window.innerHeight || document.documentElement.clientHeight;
    const { top, right, bottom, left } = element.getBoundingClientRect();
    if (topCheck) {
        if (rtop) {
            if (top > viewHeight - viewHeight * (1 - pretop) || top<60) {
                return false;
            }
        } else {
            if (top < viewHeight - viewHeight * (1 - pretop)) {
                return false;
            }
        }
    }

    if (leftCheck) {
        if (rleft) {
            if (left > viewWidth - viewWidth * (1 - preleft) || left<0) {
                return false;
            }
        }
        else {
            if (left < viewWidth - viewWidth * (1 - preleft)) {
                return false;
            }
        }
    }
    if (bottomCheck) {
        if (rbottom) {
            if (bottom < viewHeight * prebottom || bottom>viewHeight) {
                return false;
            }
        }
        else {
            if (bottom > viewHeight * prebottom) {
                return false;
            }
        }
    }
    if (rightCheck) {
        if (rright) {
            if (right < viewWidth * preright || right>viewWidth) {
                return false;
            }
        }
        else {
            if (right > viewWidth * preright) {
                return false;
            }
        }
    }
    return true;
};