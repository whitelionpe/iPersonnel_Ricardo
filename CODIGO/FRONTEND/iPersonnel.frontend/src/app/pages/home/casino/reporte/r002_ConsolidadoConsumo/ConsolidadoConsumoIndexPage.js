import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import PropTypes from 'prop-types';
import { isNotEmpty, dateFormat } from "../../../../../../_metronic";
import { getButtonPermissions, defaultPermissions } from '../../../../../../_metronic/utils/securityUtils'
import { Portlet } from "../../../../../partials/content/Portlet";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import ConsolidadoConsumoListPage from "../r002_ConsolidadoConsumo/ConsolidadoConsumoListPage";
import { serviceCasinoReporte } from '../../../../../api/casino/reporte.api';

const ConsolidadoConsumoIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;

    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const [resultadoAutorizadores, setResultadoAutorizadores] = useState([]);
    const [focusedRowKey, setFocusedRowKey] = useState();
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));

    const [dataRowEditNew, setDataRowEditNew] = useState({
        FechaInicio: new Date(new Date().getFullYear(), 0, 1),
        FechaFin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    });

    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision
    });
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    async function listarResultadoAutorizadores() {
        setLoading(true);

        let params = {
            IdDivision: perfil.IdDivision,
            IdComedor: isNotEmpty(dataRowEditNew.IdComedor) ? dataRowEditNew.IdComedor : "",
            IdServicios: isNotEmpty(dataRowEditNew.IdServicio) ? dataRowEditNew.IdServicio : "",
            IdCompania: isNotEmpty(dataRowEditNew.IdCompania) ? dataRowEditNew.IdCompania : "",
            IdCentroCosto: isNotEmpty(dataRowEditNew.IdCentroCosto) ? dataRowEditNew.IdCentroCosto : "",
            IdPersona: isNotEmpty(dataRowEditNew.Personas) ? dataRowEditNew.Personas : "",
            FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
            FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd')
        }

        await serviceCasinoReporte.listar_r002_ConsolidadoConsumo(params).then(data => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setResultadoAutorizadores(data[0]);

        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const changeTabIndex = (index) => {
        handleChange(null, index);
    }

    /****--Configuración de acceso de botones*****************************/
    const [accessButton, setAccessButton] = useState(defaultPermissions);
    const loadControlsPermission = () => {
        let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
        setAccessButton({ ...accessButton, ...buttonsPermissions });
    }
    /***********************************************************************/

    useEffect(() => {
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">

                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "CASINO.PERSON.GROUP.MENU" })}
                        SubMenu={intl.formatMessage({ id: "ACCESS.REPORT.SUBMENU" })}
                        Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
                    />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <>

                            <ConsolidadoConsumoListPage
                                dataRowEditNew={dataRowEditNew}
                                setDataRowEditNew={setDataRowEditNew}
                                resultadoAutorizadores={resultadoAutorizadores}
                                focusedRowKey={focusedRowKey}
                                accessButton={accessButton}
                                listarResultadoAutorizadores={listarResultadoAutorizadores}
                            />

                        </>

                    </Portlet>
                </div>
            </div>

        </>
    );
};


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <Portlet
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && <>{children}</>}
        </Portlet>
    );
}
TabPanel.propTypes =
{
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};
function tabPropsIndex(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}


export default injectIntl(WithLoandingPanel(ConsolidadoConsumoIndexPage));
