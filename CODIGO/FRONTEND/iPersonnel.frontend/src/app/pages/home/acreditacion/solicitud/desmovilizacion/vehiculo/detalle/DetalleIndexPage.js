import React, { Fragment, useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { Portlet } from "../../../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado, useStylesTab } from "../../../../../../../store/config/Styles";

import DetalleEditPage from './DetalleEditPage';
import { obtenerSolicitudDesmovilizacionVehiculo } from "../../../../../../../api/acreditacion/solicitud.api"

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

    const [permisosDatosPersona, setPermisoDatosPersona] = useState({
        IDTIPODOCUMENTO: false,
        DOCUMENTO: false,
        APELLIDO: false,
        NOMBRE: false,
        DIRECCION: false,
        IDUBIGEONACIMIENTO: false,
        IDUBIGEORESIDENCIA: false,
        FECHANACIMIENTO: false,
        SEXO: false,
        IDESTADOCIVIL: false,
        TELEFONOMOVIL: false,
        TELEFONOFIJO: false,
        EMAIL: false,
        IDTIPOSANGRE: false,
        ALERGIA: false,
        DISCAPACIDAD: false,
        EMERGENCIANOMBRE: false,
        EMERGENCIATELEFONO: false,
        IDPAISLICENCIACONDUCIR: false,
        IDLICENCIACONDUCIR: false,
        NUMEROLICENCIACONDUCIR: false
    });

    const [personalDataRules, setPersonalDataRules] = useState([]);
    const [optRequisito, setOptRequisito] = useState([]);
    const [flLoadPersonalDataRules, setFlLoadPersonalDataRules] = useState(false);


    useEffect(() => {

        setTimeout(() => {
            seleccionarRegistro(props.selected);
        }, 1000);

    }, []);

    const seleccionarRegistro = async (data) => {

        setLoading(true);

        let tempDataRow = {};

        await Promise.all([
            obtenerSolicitudDesmovilizacionVehiculo({ IdSolicitud: data.IdSolicitud })
        ]).then(resp => {

            // console.log("test_veiculo",resp[0] )
            let firstRegister = resp[0];

            tempDataRow =  firstRegister;
            tempDataRow.esNuevoRegistro = false;
            tempDataRow.Division = perfil.Division;
            
            setDataRowEditNew({ ...tempDataRow });

        }).catch(err => {

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
                                    permisosDatosPersona={permisosDatosPersona}
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
