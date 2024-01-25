import { useState, useEffect, useRef } from 'react';
import notify from 'devextreme/ui/notify';
import { isNotEmpty } from '../../../../_metronic';


const useImageViewer = ({
    defaultImage = "",
    maxWeight = 5000,
    imageSize = {
        width: -1,
        height: -1
    },
    imageRange = {
        min: 0,
        max: 0,
        radio: ''
    },
    setImagedLoad = () => { },
    medidaSugeridas
}) => {

    const [popupVisible, setPopupVisible] = useState(false);
    const [imgBase64, setImgBase64] = useState("");
    const [message, setMessage] = useState("");
    const [imgInfo, setImgInfo] = useState({
        fileSize: "-",
        fileName: "-",
        fileWidth: "-",
        fileHeight: "-"
    });

    const loadImageSizeDefault = async () => {

        let file = dataURLtoFile(defaultImage, 'imagen');
        let dimension = await getImageSize(file);
        //console.log(dimension);

        setImgInfo(prev => ({
            ...prev,
            fileWidth: dimension.width,
            fileHeight: dimension.height
        }));
    }

    useEffect(() => {
        if (isNotEmpty(defaultImage)) {
            setImgBase64(defaultImage);
            loadImageSizeDefault();
        }
    }, [defaultImage]);


    useEffect(() => {

        if (message !== "") {
            notify(message, 'error', 3000);

            setMessage("");
        }

    }, [message])

    const subirImagen = async (e) => {
        let input = e.target;
        if (input.files && input.files.length > 0 && input.files[0]) {
            //Se valida peso:
            let tmpFile = input.files[0];
            let tmpWeight = Math.round(tmpFile.size / 1024, 0);
            let sizeFile = formatBytes(tmpFile.size, 2);

            if (tmpWeight > maxWeight) {
                //fileOk = false;
                let mensaje = `El tamaño de su archivo ${sizeFile} es mayor al máximo pérmitido, por favor cambiar!`
                setMessage(mensaje);

                input.value = '';
                if (input.value) {
                    input.type = "text";
                    input.type = "file";
                }
                return;
            } else {

                //Se carga imagen:
                let fotoPersona = await fileToBase64(tmpFile);
                let dimension = await getImageSize(tmpFile);
                let flImageOk = false;
                let messageError = '';
                if (imageSize.width > 0) {
                    /*
                     //Se encuentra configurado el tamaño de la foto:
                     //imageRange.min
                     let conf_w = Math.round(imageSize.width);
                     let conf_h = Math.round(imageSize.height);
                     let img_w = Math.round(dimension.width);
                     let img_h = Math.round(dimension.height);
                     let tamanioExacto = conf_w === img_w || conf_h === img_h;
 
 
                     if (!tamanioExacto) {
                         //Se valida que la imagen sea proporcional al tamaño original:
                         let factor_h = conf_h / conf_w;
                         let proporcional = Math.round(factor_h * img_w) === img_h;
 
                         //console.log("factores", { factor_h, proporcional });
 
                         //En caso la imagen no sea de tamaño exacto se evalua el factor + / - 
                         if (proporcional) {
                             let max = parseFloat(imageRange.max);
                             let min = parseFloat(imageRange.min);
                             let rangoMaximo = img_w <= (conf_w * (1 + max)) && img_h <= (conf_h * (1 + max));
                             let rangoMinimo = img_w >= (conf_w * (1 - min)) && img_h >= (conf_h * (1 - min));
 
                             if (rangoMaximo && rangoMinimo) {
                                 flImageOk = true;
                             } else {
                                 flImageOk = false;
                                 messageError = `El tamaño de la imagen no esta en el rango permitido`
                             }
                         } else {
                             flImageOk = false;
                             messageError = `El tamaño de la imagen no es proporcional a ${conf_w}x${conf_h}`
                         }
                     } else {
                         //Ok
                         flImageOk = true;
                     }
                     */

                    //============= NUEVA CONFIGURACION ================
                    // RADIO ALTO
                    let conf_Radio_alto = parseFloat(medidaSugeridas.height_radio);
                    let conf_altura_bd = Math.round(imageSize.height);
                    let img_subiendo_alto = Math.round(dimension.height);
                    //RADIO ANCHO
                    let conf_Radio_ancho = parseFloat(medidaSugeridas.width_radio);
                    let conf_ancho_bd = Math.round(imageSize.width);
                    let img_subiendo_ancho = Math.round(dimension.width);

                    //PORCENTAJES - ALTO
                    let alto_arriba = conf_altura_bd + Math.round(conf_altura_bd * conf_Radio_alto);
                    let alto_bajada = conf_altura_bd - Math.round(conf_altura_bd * conf_Radio_alto);

                    //PORCENTAJES - ANCHO
                    let ancho_derecho = conf_ancho_bd + Math.round(conf_ancho_bd * conf_Radio_ancho);
                    let ancho_izquierdo = conf_ancho_bd - Math.round(conf_ancho_bd * conf_Radio_ancho);

                    let validarAlto = (alto_arriba >= img_subiendo_alto && img_subiendo_alto >= alto_bajada)
                    let validarAncho = (ancho_derecho >= img_subiendo_ancho && img_subiendo_ancho >= ancho_izquierdo)

                    if (validarAlto && validarAncho) {

                        // console.log("test_alto_ingreso!!!!", { img_subiendo_alto, alto_arriba, alto_bajada });
                        // console.log("test_ancho_ingreso!!!!", { img_subiendo_ancho, ancho_derecho, ancho_izquierdo });
                        flImageOk = true;

                    } else {

                        // console.log("test_NO_alto_ingreso!!!!", { img_subiendo_alto, alto_arriba, alto_bajada, validarAlto });
                        // console.log("test_NO_ancho_ingreso!!!!", { img_subiendo_ancho, ancho_derecho, ancho_izquierdo, validarAncho });

                        let msj = `La imagen subida tiene un alto de ${img_subiendo_alto} px y un ancho ${img_subiendo_ancho} px. Por favor,`

                        if (validarAlto) {
                            msj += ""
                        } else {
                            msj += ` para el alto se requiere como mínimo ${alto_bajada} px y máximo ${alto_arriba} px.`
                        }

                        if (validarAncho) {
                            msj += ""
                        } else {
                            msj += ` para el ancho se requiere como mínimo ${ancho_izquierdo} px y máximo ${ancho_derecho} px.`
                        }

                        flImageOk = false;
                        messageError = msj
                    }

                    //======================================================

                    if (!flImageOk) {
                        setMessage(messageError);

                        input.value = '';
                        if (input.value) {
                            input.type = "text";
                            input.type = "file";
                        }
                        return;
                    }

                }
                setMessage("");
                setImgBase64(fotoPersona[0]);
                setImgInfo({
                    ...imgInfo,
                    fileSize: sizeFile,
                    fileName: tmpFile.name,
                    fileWidth: dimension.width,
                    fileHeight: dimension.height
                });

                //add
                const imgInfo_ = {
                    ...imgInfo,
                    fileSize: sizeFile,
                    fileName: tmpFile.name,
                    fileWidth: dimension.width,
                    fileHeight: dimension.height
                }

                setImagedLoad({ imgBase64: fotoPersona[0], imgInfo, imgInfo_ });
            }

        }
    }

    function dataURLtoFile(dataurl, filename) {

        //if (dataurl.split(',').length === 1) return new File([],);  //JDL->2023-05-25->IS ES UNA IMAGEN BASE64 entonces extraer sus propiedades
        if (dataurl.split(',').length > 1) {
            var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);

            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
        } else {

            return new File([], filename, { type: "" });
        }
    }

    const getImageSize = (tmpFile) => {
        let customImg = document.createElement("img");

        const promise = new Promise((resolve, reject) => {
            customImg.onload = () => {
                const width = customImg.naturalWidth;
                const height = customImg.naturalHeight;
                resolve({ width, height });
            }
            customImg.onerror = reject;
        });


        customImg.src = window.URL.createObjectURL(tmpFile);

        return promise;
    }

    async function fileToBase64(file) {
        function getBase64(file) {
            const reader = new FileReader()
            return new Promise(resolve => {
                reader.onload = ev => {
                    resolve(ev.target.result)
                }
                reader.readAsDataURL(file)
            })
        }

        const promises = []
        promises.push(getBase64(file))
        return await Promise.all(promises);
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function verImagenZoom() {
        setPopupVisible(true);
    }

    function hideInfo(tipo) {
        setPopupVisible(false);
    }


    const refInputFile = useRef(null);

    const cargarImagen = (e) => {
        //console.log("cargarImagen", { e });
        e.preventDefault()
        if (refInputFile != null) {
            refInputFile.current.click();
        }
    }


    return {
        refInputFile,
        subirImagen,
        cargarImagen,
        verImagenZoom,
        imgBase64,
        imgInfo,
        popupVisible,
        hideInfo,

    };
};

export default useImageViewer;
