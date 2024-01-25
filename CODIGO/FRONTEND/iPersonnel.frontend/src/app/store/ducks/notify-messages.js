//import notify from "devextreme/ui/notify";
import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../../_metronic/utils/utils";
import notify from "devextreme/ui/notify";

const customMessageHandlerElementId = 'customMessageHandlerElementId';

export function handleErrorMessages(msgTitle, error, custom = false) {

    if (!!custom) {
        // localHandleErrorMessages(msgTitle, error);//
        handleInfoMessages(msgTitle, error); 
        return;
    }
    
    //console.log(error)
    if (error.response) {
        let dataError = error.response;
        //console.log("dataError", dataError);
        let { responseException } = dataError.data;
        let { exceptionMessage } = responseException;
        //console.log("exceptionMessage:::>", exceptionMessage);
        switch (dataError.status) {
            case 400:
                handleWarningMessages(msgTitle, exceptionMessage);//dataError.data
                break;
            case 500:
                const { title, status } = exceptionMessage;
                localHandleErrorMessages(status + "-" + title, "");
                break;
            default:
                localHandleErrorMessages(msgTitle, exceptionMessage); //dataError.data
                break;
        }
    } else {
        localHandleErrorMessages("Server connection error", "");
    }
}


export function handleSuccessMessages(title, message) {
    notificar(title, message, "success");
}

function localHandleErrorMessages(title, message) {
    notificar(title, message, "error");
}

export function handleInfoMessages(title, message) {
    notificar(title, message, "info");
}

export function handleWarningMessages(title, message) {
    notificar(title, message, "warning", toAbsoluteUrl("/media/iconsapp/notify_warning.png"));
}

function notificar(tittle, message, type, imgUrl = null) {
    Swal.fire({
        title: tittle,
        text: message,
        icon: imgUrl ? null : type,
        imageUrl: imgUrl,
        position: {
            my: 'center top',
            at: 'center top',
            position: 'absolute'
        }
    }, type, 3500);

}

export function handleSuccessMessagesHTML(title, message) {
    notificarHtml(title, message, "success");
}

function notificarHtml(tittle, message, type, imgUrl = null) {
    Swal.fire({
        title: tittle,
        html: message,
        icon: imgUrl ? null : type,
        imageUrl: imgUrl,
        position: {
            my: 'center top',
            at: 'center top',
            position: 'absolute'
        }
    }, type, 3500);

}

export async function confirmAction(title = "Confirmar", confirmButtonText = "SI", cancelButtonText = "NO") {
    return Swal.fire({
        title,
        icon: 'question',
        iconHtml: '?', //'؟'
        confirmButtonText,
        cancelButtonText,
        showCancelButton: true,
        showCloseButton: true,
        position: {
            my: 'center top',
            at: 'center top',
            position: 'absolute'
        }
    }, 'question', 3500);
}

export const customMessageHandler = (message, { displayTime = 30000, type = 'warning', position = 'top center', closeOnClick = true } = {}) => {
    notify({ message, type, elementAttr: { id: customMessageHandlerElementId }, position, displayTime, closeOnClick });
}
