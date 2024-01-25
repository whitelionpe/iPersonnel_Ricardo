import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { Portlet } from "../../../../../partials/content/Portlet";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import TabPanel from "../../../../../partials/content/TabPanel";
import { getStartAndEndOfMonthByDay } from '../../../../../../_metronic/utils/utils';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import EquipoAsignadoListPage from "./EquipoAsignadoListPage";
import { obtenerTodos as listaModulos, obtenerModuloConLicencia } from "../../../../../api/sistema/modulo.api";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
export const initialFilter = {
    IdCliente: '',
    //IdDivision: ''
};


const EquipoAsignadoIndexPage = (props) => {

    const { intl } = props;
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();
    const [moduloData, setModuloData] = useState([]);

    //FILTRO
    const [isFirstDataLoad, setIsFirstDataLoad] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const ds = new DataSource({ store: new ArrayStore({ data: [], key: 'RowIndex' }), reshapeOnPush: false });
    const [dataSource] = useState(ds);

    const refresh = () => dataSource.refresh();
    const resetLoadOptions = () => dataSource.resetLoadOptions();
    const [dataGridRef, setDataGridRef] = useState(null);

    const [dataRowEditNew, setDataRowEditNew] = useState({
        esNuevoRegistro: true,
        conCamas: 0
    });


    async function listarModulo() {
        let data = await obtenerModuloConLicencia({
            IdCliente: perfil.IdCliente
        }
        ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
        setModuloData(data);
    }

    useEffect(() => {
        listarModulo();
    }, []);


    return (
        <>

            <a id="iddescarga" className="" ></a>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "SYSTEM" })}
                        SubMenu={intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.REPORTE" })}
                        Subtitle={intl.formatMessage({ id: "CONFIG.MENU.SISTEMA.EQUIPOS_DISPONIBLE" })}
                    />
                    <Portlet>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.REPORTE" }) + ' - ' + intl.formatMessage({ id: "CONFIG.MENU.SISTEMA.EQUIPOS_DISPONIBLE" })}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <>
                            <div className={classes.root}>
                                <TabPanel value={0} className={classes.TabPanel} index={0}>
                                    <EquipoAsignadoListPage
                                        uniqueId={"equipoAsignadoList"}
                                        isFirstDataLoad={isFirstDataLoad}
                                        setIsFirstDataLoad={setIsFirstDataLoad}
                                        dataSource={dataSource}
                                        refresh={refresh}
                                        resetLoadOptions={resetLoadOptions}
                                        refreshData={refreshData}
                                        setRefreshData={setRefreshData}

                                        dataRowEditNew={dataRowEditNew}
                                        setDataRowEditNew={setDataRowEditNew}
                                        setDataGridRef={setDataGridRef}
                                        moduloData={moduloData}
                                    />
                                </TabPanel>
                            </div>
                        </>
                    </Portlet>
                </div>
            </div>


        </>
    );
};


export default injectIntl(WithLoandingPanel(EquipoAsignadoIndexPage));
