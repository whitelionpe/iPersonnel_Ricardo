import { Fragment, useState, useEffect, useLayoutEffect } from "react";
import { useSelector } from "react-redux";
import { PatterRuler, isNotEmpty } from "../../../../../_metronic";
import notify from "devextreme/ui/notify";
import { obtenerbydocumento as obtenerPersona } from "../../../../api/administracion/persona.api";
import { obtener as obtenerFoto } from "../../../../api/administracion/personaFoto.api";

export const useVisitArray = ({// dataRowEditNew,
    nroDocumento,
    visits,
    setVisits,
    personDataValidationRules,
    modoEdicion, tipoDocumentos, configuracion }) => {

    const [forceDisabled, setForceDisabled] = useState(false);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const [dataPersona, setDataPersona] = useState({});
    const [maxLengthDocumento, setMaxLengthDocumento] = useState(20);
    const [mascara, setMascara] = useState("");
    // const [flUpdate, setFlUpdateImage] = useState(false);
    const [reglas, setReglas] = useState("");
    // const [currentImagePersona, setCurrentImagePersona] = useState(dataRowEditNew.Foto);

    useLayoutEffect(() => {
        //console.log("Cambio en nro de documento", { nroDocumento, visits });
        let tmpPersona = visits.find(x => x.Documento === nroDocumento);
        //console.log("Persona encontrada", tmpPersona);

        if (!!tmpPersona) {
            setDataPersona(tmpPersona);
        }

    }, [nroDocumento])


    const isRequiredAccreditation = fieldName => {
        //console.log("isRequiredAccreditation", { personDataValidationRules, flag: !!personDataValidationRules });
        if (!!personDataValidationRules) {
            let valor = personDataValidationRules.find(
                x => x.IdDato.toUpperCase() === fieldName.toUpperCase()
            );

            if (valor) {
                return valor.Obligatorio === "S";
            }
        }


        return false; //Si no existe configuracion no es obligatorio
    };

    const isModifiedAccreditation = fieldName => {
        //console.log("isRequiredAccreditation", { isModifiedAccreditation });
        if (!!personDataValidationRules) {
            let valor = personDataValidationRules.find(
                x => x.IdDato.toUpperCase() === fieldName.toUpperCase()
            );

            if (valor) {
                return modoEdicion ? valor.Editable === "S" : false;
            }
        }
        return false; //Si no existe configuracion se deshabilita
    };

    const onValueChangedTipoDocumento = IdTipoDocumento => {

        if (modoEdicion) {

            let documento = tipoDocumentos.find(
                x => x.IdTipoDocumento === IdTipoDocumento
            );

            if (documento) {


                //dataPersona.Documento = "";
                let nroDocumento = (dataPersona.IdTipoDocumento === documento.IdTipoDocumento &&
                    isNotEmpty(dataPersona.Documento)) ? dataPersona.Documento : "";

                setDataPersona(prev => ({ ...prev, Documento: nroDocumento }));

                setMaxLengthDocumento(documento.Longitud);
                if (documento.Mascara !== "") {
                    setMascara(documento.Mascara);
                } else {
                    setMascara("");
                }

                if (documento.CaracteresPermitidos !== "") {
                    if (PatterRuler.hasOwnProperty(documento.CaracteresPermitidos)) {
                        setReglas(PatterRuler[documento.CaracteresPermitidos]);
                    } else {
                        setReglas("");
                    }
                } else {
                    setReglas("");
                }
            } else {
                //dataPersona.Documento = "";
                setDataPersona(prev => ({ ...prev, Documento: "" }));
                setMaxLengthDocumento(20);
            }
        }
    };

    const cargarFotoSeleccionada = data => {
        // setCurrentImagePersona(data.imgBase64);
        //props.dataPersonaFileBase64 = data.imgBase64;
        //dataPersona.Foto = data.imgBase64;
        setDataPersona({ ...dataPersona, Foto: data.imgBase64 });
        // setFlUpdateImage(true);
    };

    const loadDatosPersona = res => {
        let {
            IdPersona,
            Documento,
            IdTipoDocumento,
            TipoDocumento,
            Apellido,
            Nombre,
            Direccion,
            FechaNacimiento,
            Edad,
            Sexo,
            TelefonoMovil,
            Email
        } = res;

        return {
            IdPersona,
            Documento,
            IdTipoDocumento,
            TipoDocumento,
            Apellido,
            Nombre,
            Direccion,
            FechaNacimiento,
            Edad,
            Sexo,
            TelefonoMovil,
            Email
        };
    };

    const onEnterDocumento = async e => {
        let documento = e.component.option("value");

        //console.log("onEnterDocumento", { e, documento });

        if (isNotEmpty(documento)) {
            if (documento.length > 7) {
                setForceDisabled(true);
                let parametros = {
                    IdTipoDocumento: dataPersona.IdTipoDocumento,
                    Documento: dataPersona.Documento
                };
                await obtenerPersona(parametros)
                    .then(async res => {
                        if (res !== "" && res !== undefined) {
                            let tmp = loadDatosPersona(res);
                            //dataPersona = { ...dataPersona, ...tmp };
                            setDataPersona({ ...dataPersona, ...tmp });

                            //Se valida si existe solicitudes pendientes:
                            //console.log("validacion", validacion);

                            //await loadDatosEvaluar(parametros);

                            await obtenerFoto({
                                IdPersona: tmp.IdPersona,
                                IdCliente: perfil.IdCliente
                            }).then(res => {
                                if (res.FotoPC !== "") {
                                    // setCurrentImagePersona(res.FotoPC);
                                    //dataPersona = { ...dataPersona, ...tmp, Foto: res.FotoPC }
                                    setDataPersona({
                                        ...dataPersona,
                                        ...tmp,
                                        Foto: res.FotoPC
                                    });
                                    //setFlUpdateImage(true);
                                }
                            });
                        } else {
                            //Se limpian datos:
                            let limpiar = {
                                IdPersona: 0,
                                //Documento: '',
                                //IdTipoDocumento: '', TipoDocumento: '',
                                Apellido: "",
                                Nombre: "",
                                Direccion: "",
                                FechaNacimiento: "",
                                Edad: 0,
                                Sexo: "",
                                TelefonoMovil: "",
                                Email: ""
                            };

                            //dataPersona = { ...dataPersona, ...limpiar, Foto: "" };
                            setDataPersona({
                                ...dataPersona,
                                ...limpiar,
                                Foto: ""
                            });
                            // setCurrentImagePersona("");
                            //setCurrentImagePersona(props.dataRowEditNew.FileBase64);
                            // setFlUpdateImage(true);

                            const type = "warning"; //e.value ? 'success' : 'error';
                            const text = "No existe datos para el documento ingresado."; // "Solicitud enviada, no se puede editar."; //props.product.Name + (e.value ? ' is available' : ' is not available');
                            notify(text, type, 3000);
                        }
                    })
                    .catch(err => { })
                    .finally(res => {
                        setForceDisabled(false);
                    });
            }
        }
    };

    const onValueChangedFechaNacimiento = e => {
        //console.log("onValueChangedFechaNacimiento");
        let FechaNacimiento = new Date(e.value);
        let FechaActual = new Date();
        let edad = FechaActual.getFullYear() - FechaNacimiento.getFullYear();
        //configuracion
        //console.log({ FechaNacimiento, edad });
        if (e.value != null) {
            if (edad > configuracion.Valor1) {
                //console.log("SE CAMBIA EDAD");
                //dataPersona.Edad = edad;
                setDataPersona(prev => ({ ...prev, Edad: edad }));
            }
        }
    };


    return {
        //Variables para el formulario:
        dataPersona,
        forceDisabled,
        maxLengthDocumento,
        reglas,
        // currentImagePersona,
        mascara,
        //Funciones para validar formulario:
        isRequiredAccreditation,
        isModifiedAccreditation,
        onValueChangedTipoDocumento,
        cargarFotoSeleccionada,
        onEnterDocumento,
        onValueChangedFechaNacimiento
    };
}

