import React, { useEffect, useState } from "react";
//import { useSelector } from "react-redux";
import {
    DataGrid,
    Column,
    
} from "devextreme-react/data-grid";
//import { Button } from "devextreme-react";
// import {
//     PortletBody,
//     PortletHeader,
//     PortletHeaderToolbar,
// } from "../../../../../partials/content/Portlet";
//import { useStylesEncabezado } from "../../../../store/config/Styles";
//import Form, { Item, GroupItem } from "devextreme-react/form";
//import PersonaRequisitosPorPerfil from "./PersonaRequisitosPorPerfil.js"; 
//import { isNotEmpty } from "../../../../../../_metronic";

import { personas as obtenerMarcacionPersonas } from "../../../../../api/acceso/vehiculoMarcacion.api";

//Multi-idioma
import { injectIntl } from "react-intl";
//import { connect } from "react-redux";

// import {
//     handleErrorMessages,
//     handleSuccessMessages,
//     handleWarningMessages,
// } from "../../../../../store/ducks/notify-messages";

//import { listarTipoMarcacion } from "../../../../../../_metronic/utils/utils";
const PersonaMarcacionPorVehiculo = (props) => {
    //multi-idioma
    const { intl } = props;
    const [dataSource, setDataSource] = useState([]);

    function onCellPrepared(e) {
        if (e.rowType === "data") {
            if (e.data.AccesoNegado === "S") {
                e.cellElement.style.color = "red";
            }
        }
    }

    function cellRender(param) {
        if (param && param.data) {
            let Tipo = `dx-icon-${(param.data.Tipo == "C") ? "car" : "user"}`;
            let hit = (param.data.Tipo == "C") ? "Chofer" : "Pasajero";

            return <i class={Tipo} title={hit} ></i>;
            //  
        }
    }
    //Personas:
    const cargarGrilla = async () => {
        console.log(props.data.data);
        let { IdSecuencial, IdVehiculo } = props.data.data;
       // console.log("-->", IdSecuencial, IdVehiculo);
        let data = await obtenerMarcacionPersonas({ IdVehiculo, IdSecuencial });
        setDataSource(data);
    };

    useEffect(() => {
        cargarGrilla();
    }, []);


    return (
        <>

            <DataGrid
                dataSource={dataSource}
                showBorders={true}
                columnAutoWidth={true}
                onCellPrepared={onCellPrepared}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
            >
                <Column dataField="RowIndex" caption="#" width={40} />
                <Column dataField="Compania" caption={intl.formatMessage({ id: "ACCESS.VEHICLE.COMPANY", })} />
                <Column dataField="Documento" caption={intl.formatMessage({ id: "ACCESS.VEHICLE.DOCUMENT", })} />
                <Column dataField="Nombres" caption={intl.formatMessage({ id: "ACCESS.VEHICLE.NAMES", })} />
                <Column dataField="TipoMarcacion" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.RESULT", })} />

                <Column dataField="FechaMarca"  dataType="date" format="dd/MM/yyyy hh:mm" caption={intl.formatMessage({ id:   "ACCESS.PERSON.MARK.DATE", })} />
                <Column dataField="Funcion" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.FUNCTION"})} />

                {/* <Column dataField="Funcion" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.FUNCTION", })} width={80} alignment={"center"} /> */}
                <Column dataField="Tipo" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.TYPE", })} cellRender={cellRender} alignment={"center"} />
            

           
            </DataGrid>

        </>
    );
};

export default injectIntl(PersonaMarcacionPorVehiculo);



