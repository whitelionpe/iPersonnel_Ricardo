
import React, { Fragment, useState, useEffect } from 'react';

import { injectIntl } from "react-intl";
import { DataGrid, Column, Summary, TotalItem, Button as ColumnButton } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";
import './SolcitudPage.css';
import RemoveFromQueue from "@material-ui/icons/RemoveFromQueue";
import { Popover } from 'devextreme-react/popover';

const SolicitudListPage = ({
    intl,
    colorRojo,
    colorVerde,
    solicitudes,
    focusedRowKey,
    seleccionarRegistro,
    cancelarEdicion,
    getInfo,
    abrirSolicitudDetalle,
}) => {

    const [withTitleVisible, setWithTitleVisible] = useState(false);

    const seleccionarSolicitud = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) seleccionarRegistro(evt.row.data);

    };

    useEffect(() => {

    });




    const cellEstadoRender = (e) => {
        //console.log("cellEstadoRender", e);
        let estado = e.data.EstadoAprobacion;
        let css = '';
        let estado_txt = "";
        if (e.data.EstadoAprobacion.trim() === null) {
            estado = "I";
        }

        switch (estado) {
            case 'I': css = 'estado_item_incompleto'; estado_txt = intl.formatMessage({ id: "COMMON.INCOMPLETE" }); break;
            case 'P': css = 'estado_item_pendiente'; estado_txt = intl.formatMessage({ id: "COMMON.EARRING" }); break;
            case 'O': css = 'estado_item_observado'; estado_txt = intl.formatMessage({ id: "COMMON.OBSERVED" }); break;
            case 'R': css = 'estado_item_rechazado'; estado_txt = intl.formatMessage({ id: "COMMON.REJECTED" }); break;
            case 'A': css = 'estado_item_aprobado'; estado_txt = intl.formatMessage({ id: "COMMON.APPROVED" }); break;
        };


        return (css === '') ?
            <div className={"estado_item_general"}>{estado_txt}</div>
            : <div className={`estado_item_general  ${css}`}   >{estado_txt}</div>
    }

    function calculateColor(diasTranscurridos) {
        if (diasTranscurridos > colorRojo) {
            return "red";
        }
        else if (diasTranscurridos <= colorVerde) {
            return "green";
        }
        else if (diasTranscurridos === 2) {
            return "yellow";
        }
    }



    function cellRenderColorTiempoCredencial(param) {
        if (param && param.data) {

            const { DiasTranscurridos } = param.data;

            let color = calculateColor(DiasTranscurridos);

            if (color === "red") {
                return <span ><i className="fas fa-circle text-red-color icon-10x" ></i> </span>
            } else if (color === "green") {
                return <span ><i className="fas fa-circle  text-success icon-10x" ></i></span>
            } else if (color === "yellow") {
                return <span ><i className="fas fa-circle text-warning icon-10x"></i></span>
            }


        }
    }


    const leyendaDiasTranscurridos = () => {
        return (<>
            <div className="content">
                <div className="row">
                    <i className="fas fa-circle  text-success icon-10x" > &nbsp; {intl.formatMessage({ id: "ACCREDITATION.LEGEND.UNDER" }) + colorVerde + intl.formatMessage({ id: "ACCREDITATION.LEGEND.DAY" })}   </i> &nbsp; &nbsp;
                </div>
                <div className="row">
                    <i className="fas fa-circle  text-warning icon-10x" > &nbsp; {intl.formatMessage({ id: "ACCREDITATION.LEGEND.HALF" }) + colorVerde + " - " + colorRojo + intl.formatMessage({ id: "ACCREDITATION.LEGEND.DAYS" })}   </i> &nbsp; &nbsp;
                </div>
                <div className="row">
                    <i className="fas fa-circle  text-red-color icon-10x" > &nbsp; {intl.formatMessage({ id: "ACCREDITATION.LEGEND.HIGH" }) + colorRojo + intl.formatMessage({ id: "ACCREDITATION.LEGEND.DAYS" })}   </i> &nbsp; &nbsp;
                </div>
            </div>
        </>)
    }




    return (
        <>

            <HeaderInformation data={getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="fa fa-times-circle"
                                    type="normal"
                                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                    onClick={cancelarEdicion}
                                />
                            </PortletHeaderToolbar>
                        }
                    />
                }
            />

            <PortletBody>
                <DataGrid
                    dataSource={solicitudes}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    // onFocusedRowChanged={seleccionarRegistro}
                    focusedRowKey={focusedRowKey}
                    //repaintChangesOnly={true}
                    onFocusedRowChanged={seleccionarSolicitud}
                >
                    <Column dataField="" width={"2%"} alignment="left" cellRender={cellRenderColorTiempoCredencial} />
                    <Column dataField="IdSolicitud" caption={intl.formatMessage({ id: "ACCREDITATION.REQUEST" })} width={"8%"} alignment={"center"} />
                    <Column dataField="CompaniaMandante" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY.ABR" })} width={"12%"} alignment={"left"} />
                    <Column dataField="CompaniaContratista" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY.ABR" })} width={"11%"} alignment={"left"} />
                    <Column dataField="Asunto" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })} width={"10%"} alignment={"left"} />
                    <Column dataField="Perfil" caption={intl.formatMessage({ id: "ACCESS.PROFILE" })} width={"15%"} alignment={"left"} />
                    <Column dataField="FechaSolicitud" caption={intl.formatMessage({ id: "ADMINISTRATION.REQUEST.DATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} width={"10%"} />
                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} width={"10%"} />
                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} width={"10%"} />

                    <Column dataField="EstadoAprobacion" 
                        caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} 
                        width={"103px"}
                        allowSorting={true}
                        allowFiltering={false}
                        allowHeaderFiltering={false}
                        alignment={"center"}
                        cellRender={cellEstadoRender}
                    />

                    <Column type="buttons" width={35} visible={true}
                    >
                        <ColumnButton icon="fas fa-file" hint={intl.formatMessage({ id: "ACCREDITATION.BTN.APPROVE" })}
                            onClick={abrirSolicitudDetalle}
                        />

                    </Column>

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="CompaniaMandante"
                            alignment="left"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>


                </DataGrid>


                <div className="dx-field-value-static">
                    <p style={{ color: "black" }}>
                        <span id="subject2"></span>
                        <RemoveFromQueue />
                        <a
                            id="link2"
                            style={{ color: "black" }}
                            onMouseEnter={() => setWithTitleVisible(!withTitleVisible)}
                            onMouseLeave={() => setWithTitleVisible(!withTitleVisible)}
                        > {intl.formatMessage({ id: "ACCREDITATION.LEGEND" })}
                        </a>

                    </p>
                    <Popover
                        target="#link2"
                        position="top"
                        width={300}
                        showTitle={true}
                        title={intl.formatMessage({ id: "ACCREDITATION.LEGEND.TITLE" })}
                        visible={withTitleVisible}
                    >
                        {leyendaDiasTranscurridos()}
                    </Popover>
                </div>

            </PortletBody>
        </>
    );
};

export default injectIntl(SolicitudListPage);
