import React, { Fragment, useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { Portlet } from "../../../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado, useStylesTab } from "../../../../../../../store/config/Styles";
import DetalleEditPage from './DetalleEditPage';
import { obtenerSolicitudVehiculoAutorizador } from "../../../../../../../api/acreditacion/solicitud.api"
import { obtener as obtenerDetalle, obtenerbyautorizadorTodos } from "../../../../../../../api/acreditacion/solicitudDetalle.api"
import { isNotEmpty, convertyyyyMMddToDate, isDate } from "../../../../../../../../_metronic";

import "./styles.css";

const DetalleIndexPage = (props) => {

    const { intl, setLoading, dataMenu } = props;
    const classesEncabezado = useStylesEncabezado();
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classes = useStylesTab();
    const [modoEdicion, setModoEdicion] = useState(false);
    const [verEdit, setVerEdit] = useState(false);
    //-------------------------
    const initParameters = {
        IdDivision: perfil.IdDivision,
        Division: perfil.Division,
        IdCompania: '',
        Asunto: ''
    };


    const [dataRowEditNew, setDataRowEditNew] = useState({
        esNuevoRegistro: true,
        ...initParameters
    });

    const [permisosDatosVehiculo, setPermisoDatosVehiculo] = useState({
        PLACA: false,

    });


    //Perfil y Datos de editar:
    const [requisitos, setRequisitos] = useState([]);
    //---------------------------------------------------------------------------

    const [personalDataRules, setPersonalDataRules] = useState([]);
    const [optRequisito, setOptRequisito] = useState([]);
    const [flLoadPersonalDataRules, setFlLoadPersonalDataRules] = useState(false);


    useEffect(() => {

        //cargarCombos();
        setTimeout(() => {
            seleccionarRegistro(props.selected);
        }, 1000);

    }, []);

    const seleccionarRegistro = async (data) => {

        setLoading(true);

        let tempDataRow = {};
        //8debugger;
        await Promise.all([
            obtenerSolicitudVehiculoAutorizador({ IdSolicitud: data.IdSolicitud }),
            // obtenerSolicitud({ IdDivision: perfil.IdDivision, IdSolicitud: data.IdSolicitud }),
            obtenerbyautorizadorTodos({ IdSolicitud: data.IdSolicitud })
        ]).then(resp => {

            console.log("seleccionarRegistro.resp[0]:-->", resp[0]);

            tempDataRow = resp[0][0];
            console.log("tempDataRow>1>", tempDataRow);
            tempDataRow = tempDataRow[0];
            console.log("tempDataRow>2>", tempDataRow);

            tempDataRow.esNuevoRegistro = false;
            //tempDataRow.IdDivision = perfil.IdDivision;
            tempDataRow.Division = perfil.Division;

            let datosEvaluar = resp[0][1];
            let datosEntidad = resp[1][3];
            let [, , requisitos, detalleDatosEvaluar] = resp[0];
            //============================================================
            //CARGANDO REQUISITOS Y DATOS A EVALUAR:
            let arrayItems = [];
            let tmpDatosEvaluar = {};
            let contItems = 0;
            
            console.log("requisitos|requisitos", requisitos);
            console.log("datosEvaluar", datosEvaluar);
            console.log("detalleDatosEvaluar", detalleDatosEvaluar);
            setRequisitos(requisitos); //add

            for (let i = 0; i < requisitos.length; i++) {
                arrayItems.push({
                    Value: requisitos[i].IdRequisito,
                    Text: requisitos[i].Requisito,
                    AdjuntarArchivo: 'N',
                    Tipo: 'G',
                    ValorDefecto: "",
                    IdRequisito: '',
                    NombreArchivo: '',
                    Index: `R|${requisitos[i].IdRequisito}|${requisitos[i].IdRequisito}`
                });

                //Agregando datos evaluar:
                contItems = 0;
                for (let j = 0; j < datosEvaluar.length; j++) {

                    if (requisitos[i].IdRequisito === datosEvaluar[j].IdRequisito) {

                        let item = {
                            Value: datosEvaluar[j].IdDatoEvaluar,
                            Text: datosEvaluar[j].DatoEvaluar,
                            AdjuntarArchivo: datosEvaluar[j].DatoEvaluar, //'N',//Autorizador no adjunta.
                            Tipo: datosEvaluar[j].Tipo,
                            ValorDefecto: datosEvaluar[j].Valor,
                            IdRequisito: datosEvaluar[j].IdRequisito,
                            NombreArchivo: datosEvaluar[j].NombreArchivo,
                            Index: `D|${datosEvaluar[j].IdRequisito}|${datosEvaluar[j].IdDatoEvaluar}`,

                            Observacion: datosEvaluar[j].Observacion,
                            EstadoAprobacion: datosEvaluar[j].EstadoAprobacion.replace(' ', ''),
                            Aprobar: datosEvaluar[j].Aprobar,
                            TipoRequisito: datosEvaluar[j].TipoRequisito,

                            IdDatoEvaluar: datosEvaluar[j].IdDatoEvaluar,
                            UsuarioAprobacion: datosEvaluar[j].UsuarioAprobacion,
                            FechaAprobacion: datosEvaluar[j].FechaAprobacion,
                            HoraAprobacion: datosEvaluar[j].HoraAprobacion,
                        };


                        if (item.Tipo === 'F' && isNotEmpty(item.ValorDefecto)) {
                            // console.log("=================================  ES FECHA ");

                            // console.log("");
                            let fec = convertyyyyMMddToDate(item.ValorDefecto);
                            if (isDate(fec)) {
                                //console.log("=================================  ES FECHA VALIDA ");
                                item.ValorDefecto = fec;
                            } else {
                                item.ValorDefecto = "";
                            }
                        }

                        if (item.Tipo === "A") {
                            item.ValorDefecto = `[ARCHIVO][${item.NombreArchivo}]`;
                        }

                        //console.log("=================================  FIN ");
                        //Agregando value:
                        tmpDatosEvaluar[item.Index] = item.ValorDefecto;
                        tmpDatosEvaluar[`${item.Index}|OBS`] = item.Observacion;//Agregando Observacion
                        tmpDatosEvaluar[`${item.Index}|CHECK`] = item.EstadoAprobacion;//Agregando EstadoAprobacion

                        if (item.Tipo === 'L') {
                            //Agregando detalle: 
                            let arrayDetalle = detalleDatosEvaluar
                                .filter(l => l.IdDatoEvaluar === item.Value)
                                .map(m => ({ Dato: m.Dato, IdDato: m.Dato }));

                            item.Lista = arrayDetalle;
                        }
                        arrayItems.push(item);
                        contItems++;
                    }
                }



            }
            //============================================================
            //Entidades: 
            let permisos = permisosDatosVehiculo;

            for (let i = 0; i < datosEntidad.length; i++) {
                let propiedad = datosEntidad[i].IdDato.toUpperCase();
                let propiedadId = `ID${datosEntidad[i].IdDato.toUpperCase()}`;
                if (permisos.hasOwnProperty(propiedad)) {
                    permisos[propiedad] = true;
                }
                if (permisos.hasOwnProperty(propiedadId)) {
                    permisos[propiedadId] = true;
                }
            }
            console.log("seleccionarRegistro.tempDataRow:>", tempDataRow);
            console.log("seleccionarRegistro.tmpDatosEvaluar:>", tmpDatosEvaluar);

            //========================================
            setDataRowEditNew({ ...tempDataRow, ...tmpDatosEvaluar });
            setPermisoDatosVehiculo(permisos);
            console.log("arrayItems:", arrayItems);
            setOptRequisito(arrayItems);
        }).catch(err => {
          console.log(err);
        }).finally(resp => {
            setVerEdit(true);
            setLoading(false);
            setModoEdicion(true);
        });

    }



    return (

        <Fragment>

            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                        <div className={classes.root}>
                            {verEdit ? (
                                < DetalleEditPage
                                    dataRowEditNew={dataRowEditNew}
                                    permisosDatosVehiculo={permisosDatosVehiculo}
                                    optRequisito={optRequisito}
                                    setOptRequisito={setOptRequisito}
                                    modoEdicion={modoEdicion}
                                    personalDataRules={personalDataRules}
                                    setFlLoadPersonalDataRules={setFlLoadPersonalDataRules}
                                    flLoadPersonalDataRules={flLoadPersonalDataRules}
                                    cancelarEdicion={props.cancelarEdicion}
                                    cargarDatos={verEdit}
                                    colorRojo={props.colorRojo}
                                    colorVerde={props.colorVerde}
                                    detalle={requisitos}

                                />

                            ) : null}
                        </div>

                    </Portlet>
                </div>
            </div>

        </Fragment>

    );
};

export default injectIntl(WithLoandingPanel(DetalleIndexPage));
