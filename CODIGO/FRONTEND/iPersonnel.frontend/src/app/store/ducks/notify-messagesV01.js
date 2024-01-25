import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../../_metronic/utils/utils";

export function handleErrorMessages(msgTitle, error, isToast = true) {
    if (typeof error === "string") {
        localHandleErrorMessages(msgTitle, error, isToast); //dataError.data
        return;
    }

    if (error.response) {
        let dataError = error.response;
        let { responseException } = dataError.data;
        let { exceptionMessage } = responseException;
        switch (dataError.status) {
            case 400:
                handleWarningMessages(msgTitle, exceptionMessage);//dataError.data
                break;
            case 500:
                const { title, status } = exceptionMessage;
                localHandleErrorMessages(status + "-" + title, "", isToast);
                break;
            default:
                localHandleErrorMessages(msgTitle, exceptionMessage, isToast); //dataError.data
                break;
        }
    } else {
        localHandleErrorMessages("Server connection error", "");
    }
}

export function handleSuccessMessages(title, message, type = "", isToast = true) {
    isToast ? toast("success", message) : notificar(title, message, "success");
}

export function handleSuccessMessagesMasivo(title, message, buttonMessage = "Regresar al dashboard") {
    Swal.fire({
        icon: "success",
        title: title,
        text: message,
        // confirmButtonText: `${buttonMessage} <img src="/new_logos/arrow_next.svg"/>`,
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
            popup: 'popup-masivo',
            title: 'popup-masivo-title',
            icon: 'popup-masivo-icon',
            text: 'popup-masivo-message',
            header: 'popup-masivo-header',
            // confirmButton: 'popup-masivo-button',
            closeButton: 'popup-masivo-close'
        },
      }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = ""
        }
      })
}

function localHandleErrorMessages(title, message, isToast) {
    isToast ? toast("error", message) : notificar(title, message, "error");
}

export function handleInfoMessages(title, message, isToast = true) {
    isToast ? toast("info", message) : notificar(title, message, "info");
}

export function handleWarningMessages(title, message, isToast = true) {
    isToast ? toast("warning", message) : notificar(title, message, "warning", toAbsoluteUrl("/media/icons.app/notify_warning.png"));
}

// export function handleErrorToast(message){

// }

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
        },
    }, type, 3500);
}

export function toast(icon, message){
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: false,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        },
        borderRadius:"20px",
        height: "90px",
        width:"450px",
        fontSize:"25px",
        fontWeight:"700",
        lineHeight: "28px",
        letterSpacing: "0.75px,"
      })

      Toast.fire({
        icon: icon,
        title: message
      })
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
        },
        customClass: {
            popup: ''
        }
    }, type, 3500);

}

export async function confirmAction(title = "Confirmar", confirmButtonText = "SI", cancelButtonText = "NO") {
    return Swal.fire({
        title,
        icon: 'question',
        iconHtml: '؟',
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
