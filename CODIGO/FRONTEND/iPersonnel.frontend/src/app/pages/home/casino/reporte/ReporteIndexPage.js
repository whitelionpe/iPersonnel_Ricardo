import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import ReporteFilterPage from "./ReporteFilterPage";
//import { listarTreeView } from "../../../../api/casino/comedorServicio.api";

import DocumentSelector from '../../../../partials/report/DocumentSelector';
import { ReportServerProvider } from '../../../../partials/report/ReportServerContext';
import ReportServerDocumentViewer from '../../../../partials/report/ReportServerDocumentViewer';



const ReporteIndexPage = (props) => {
    //const usuario = useSelector(state => state.auth.user);
    const { intl, setLoading, dataMenu } = props;
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };
    const [selected, setSelected] = useState({ IdCliente: perfil.IdCliente });

    const [document, setDocument] = useState(-1);//2449

    /* 
        const [menuTreev, setMenuTreev] = useState([{
            Icon: "flaticon2-expand"
            , IdMenu: null
            , IdMenuPadre: null
            , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
            , MenuPadre: null
            , Nivel: 0
            , expanded: true
            , selected: false
        }]); */

    /*******************************************************************************/
    //console.log("ReporteListPage",dataFilter);

    const [dataFilter, setDataFilter] = useState({
        IdComedor: "",
        IdServicio: "",
        IdTipoDocumento: "",
        IdTipoPosicion: "",
        IdGrupo: "",
        Valor: ""
    });

    async function generarFiltro(data) {
        const { IdReporte, IdComedor, IdServicio } = data;

        /* props.consultarRegistro({
            IdReporte: IdReporte,
            IdComedor: IdComedor,
            IdServicio: IdServicio
        }); */
    }


    /* async function treeViewReporte() {
        setLoading(true);
        const { IdCliente, IdDivision } = selected;
        //let cmbServicios = 
        await listarTreeView({
            IdCliente
            , IdDivision
            , IdComedor: '%'
        }).then(cmbServicios => {
            setMenuTreev(cmbServicios);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });

    } */

    useEffect(() => {
    }, []);



    return (
        <>
            {/* <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "CASINO.REPORT.MENU" })}
                        SubMenu={intl.formatMessage({ id: "CASINO.REPORT.SUBMENU" })}
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
                            <div className={classes.root}>
                                <Tabs
                                    orientation="vertical"
                                    value={tabIndex}
                                    onChange={handleChange}
                                    aria-label="Vertical tabs"
                                    className={classes.tabs}
                                    variant="fullWidth"
                                    indicatorColor="primary"
                                    textColor="primary" >
                                    <Tab
                                        label={intl.formatMessage({ id: "CASINO.REPORT.SUBMENU" })}
                                        icon={<AssessmentOutlinedIcon fontSize="large" />}
                                        //onClick={(e => obtenerReporte(selected))}
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CASINO.REPORT.SUBMENU" })}
                                        icon={<AssessmentOutlinedIcon fontSize="large" />}
                                        //onClick={(e => obtenerReporte(selected))}
                                        {...tabPropsIndex(1)}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <>
                                        <ReporteFilterPage
                                            //consultarRegistro={buscarReporte}
                                            generarFiltro={generarFiltro}
                                            dataFilter={dataFilter}
                                            dataMenu={dataMenu}
                                        //menuTreev={menuTreev}
                                        />

                                    </>
                                </TabPanel> 
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>*/}
                                    <ReportServerProvider
                                        serviceBaseUrl="https://reportserver.devexpress.com"
                                        username="Guest"
                                        password=""
                                    >
                                        <DocumentSelector documentSelected={setDocument} />
                                        <ReportServerDocumentViewer document={document || {}} />
                                    </ReportServerProvider>
                                 {/*</TabPanel>

                            </div>
                        </>
                    </Portlet>
                </div>
            </div> */}
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
export default injectIntl(WithLoandingPanel(ReporteIndexPage));
