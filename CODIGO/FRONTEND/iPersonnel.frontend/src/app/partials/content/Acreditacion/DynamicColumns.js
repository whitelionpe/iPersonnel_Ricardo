import React, { Fragment } from 'react';
import Form, {
    Item,
    GroupItem,
    EmptyItem,
    Label
} from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { Button } from "devextreme-react";
import './DynamicColumns.css';
import styled from '@emotion/styled';
import { Dropdown } from 'react-bootstrap';
import { FormattedMessage, useIntl, injectIntl } from "react-intl";
import { Tooltip } from 'devextreme-react/tooltip';


export const BotonAutorizador = styled.button`
    padding-top: 5px;
    padding-bottom: 5px; 
    -ms-flex: 1 1 auto;
    flex: 1 1 auto;
    min-height: 1px;
    padding-left: 10px;
    padding-right: 10px;
`;

export const ImgSinAdjunto = styled.div`
    text-align: center;
    width: 50px;
    border: 1px solid #005389;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 7px;
    padding-bottom: 7px;
    font-size: 9px;
    background-color: white;
    margin: auto; 
    color: #005389;
    `;


export const createItem = (item, modoEdicion, evento) => {
    let elemento = null;
    //item.Index = index;
    ////console.log("======================================");
    ////console.log("SE CREA ELEMENTO DE TIPO ::::", item.Tipo, item.Text);

    switch (item.Tipo) {
        case "N": elemento = createItemNumber(item, modoEdicion, evento); break;//Numero
        case "T": elemento = createItemText(item, modoEdicion, evento); break;//Texto
        case "F": elemento = createItemDate(item, modoEdicion, evento); break;//Fecha
        case "L": elemento = createItemList(item, modoEdicion, evento); break;//Lista
        case "G": elemento = CreateItemGroup(item, modoEdicion, evento); break;//Grupo 
        case "B": elemento = CreateItemVacio(item, modoEdicion, evento, true); break;//Vacio 
    }
    ////console.log("======================================");
    return elemento;
}


export const createItemAutorizador = (item, modoEdicion, eventoDescarga, eventoEstado, esAutorizador, intl) => {
    let elemento = null;
    //const intl = useIntl();
    //item.Index = index;
    //intl.formatMessage
    item.Aprobar = 'N';

    /* //console.log("======================================");
    //console.log("SE CREA ELEMENTO DE TIPO ::::", item.Tipo, item.Text);
    //console.log("Adjuntar archivo:::", item.AdjuntarArchivo); */
    switch (item.Tipo) {
        case "N": elemento = createItemNumber(item, modoEdicion, eventoDescarga, true); break;//Numero
        case "T": elemento = createItemText(item, modoEdicion, eventoDescarga, true); break;//Texto
        case "F": elemento = createItemDate(item, modoEdicion, eventoDescarga, true); break;//Fecha
        case "L": elemento = createItemList(item, modoEdicion, eventoDescarga, true); break;//Lista
        case "G": elemento = CreateItemGroup(item, modoEdicion, eventoDescarga, true); break;//Grupo 
        case "A": elemento = createItemFileText(item, modoEdicion, eventoDescarga, true); break;//Archivo 
        //case "B": elemento = CreateItemVacio(item, modoEdicion, evento, true); break;//Vacio 
    }
    //console.log("======================================");

    const eventoClick = (value) => {

        let elemento = document.getElementById(`${item.Index}|CHECKBUTTON`);

        elemento.classList.remove("btn-observado");
        elemento.classList.remove("btn-pendiente");
        elemento.classList.remove("btn-rechazado");
        elemento.classList.remove("btn-aprobado");
        let tipo = value === 'A' ? 'btn-aprobado' : value === 'R' ? 'btn-rechazado' : value === 'O' ? 'btn-observado' : 'btn-pendiente';
        let descripcion = value === 'A' ? 'Aprobado' : value === 'R' ? 'Rechazado' : value === 'O' ? 'Observado' : 'Pendiente';

        elemento.classList.add(tipo);
        elemento.firstChild.data = descripcion;

        eventoEstado({ Index: item.Index, value });
    }

    if (item.Tipo != "G") { //Autorizador no adjunta archivo:

        let descripcion = item.EstadoAprobacion === 'A' ? 'Aprobado' : item.EstadoAprobacion === 'R' ? 'Rechazado' : item.EstadoAprobacion === 'O' ? 'Observado' : 'Pendiente';
        let tipo = item.EstadoAprobacion === 'A' ? 'btn-aprobado' : item.EstadoAprobacion === 'R' ? 'btn-rechazado' : item.EstadoAprobacion === 'O' ? 'btn-observado' : 'btn-pendiente';

        return (

            <GroupItem
                key={`GIA_${item.Index}`}
                colCount={8}
                colSpan={2}
                cssClass={`clsTextExtenso3 borderbotton ${(item.TipoRequisito == "A") ? "grupo_autorizador" : "grupo_solicitante"}`}
            >

                <GroupItem colSpan={3}>
                    {elemento}
                </GroupItem>

                <GroupItem
                    colSpan={5}
                    colCount={13}
                    cssClass={`clsTextExtenso clsResponsive_ ${(item.Aprobar == "S" && item.TipoRequisito == "A") ? "clsFondo" : ""}`}>
                    <Item
                        dataField={`${item.Index}|OBS`}
                        label={{ text: intl.formatMessage({ id: "COMMON.OBSERVATION" }) }}
                        editorType={"dxTextArea"}
                        cssClass={"clsTextExtenso2"}
                        colSpan={8}

                        style={{
                            backgroundColor: "#C9F7F5"
                        }}

                        editorOptions={{
                            maxLength: 500,
                            placeholder: intl.formatMessage({ id: "ACCREDITATION.EDIT.OBSERVATION" }),
                            //disabled: (item.Aprobar == "N"),
                            readOnly: true,
                        }}
                    />

                    <Item
                        dataField={""}
                        colSpan={0}
                        label={""}
                        cssClass={""}
                    >
                        <Fragment >
                            {item.EstadoAprobacion != 'P' && (
                                <div>
                                    <div id={`id_${item.IdRequisito}_${item.IdDatoEvaluar}_${item.EstadoAprobacion}`} className={"icon_estado_grid"} >
                                        <i className="dx-icon-user"></i>
                                    </div>
                                    <Tooltip
                                        target={`#id_${item.IdRequisito}_${item.IdDatoEvaluar}_${item.EstadoAprobacion}`}
                                        showEvent="dxhoverstart"
                                        hideEvent="dxhoverend"
                                        position="left"
                                    >
                                        <div style={{ textAlign: "left" }}>
                                            <strong>{intl.formatMessage({ id: "AUTH.INPUT.USERNAME" }).toUpperCase()}:&nbsp;</strong>{item.UsuarioAprobacion}<br />
                                            <strong>{intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }).toUpperCase()}:&nbsp;</strong>{item.FechaAprobacion}<br />
                                            <strong>{intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" }).toUpperCase()}:&nbsp;</strong>{item.HoraAprobacion}
                                        </div>
                                    </Tooltip>
                                </div>
                            )}
                        </Fragment>
                    </Item>

                    <Item
                        dataField={`${item.Index}|CHECK`}
                        colSpan={2}
                        label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                        cssClass={"clsFilaRadios"}
                        disabled={true}
                    >
                        {item.Aprobar == "S" && item.TipoRequisito == "A" ? (
                            <div>

                                <Dropdown>
                                    <Dropdown.Toggle
                                        id={`${item.Index}|CHECKBUTTON`}
                                        className={`font-weight-bold ${tipo}`}
                                    //readOnly={true}
                                    >
                                        {descripcion}

                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item href="#" onClick={() => { eventoClick('P'); }} >Pendiente</Dropdown.Item>
                                        <Dropdown.Item href="#" onClick={() => { eventoClick('A'); }} >Aprobado</Dropdown.Item>
                                        <Dropdown.Item href="#" onClick={() => { eventoClick('R'); }} >Rechazado</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        ) : (
                            <div>


                                <Dropdown>
                                    <Dropdown.Toggle variant={tipo} id={`${item.Index}|CHECKBUTTON`}
                                        className={`${item.Aprobar == "S" ? "" : "readOnly"} font-weight-bold ${tipo}`}
                                        readOnly={true}
                                    >
                                        {descripcion}
                                    </Dropdown.Toggle>
                                    {item.EstadoAprobacion === 'P' ? (
                                        <Dropdown.Menu>
                                            <Dropdown.Item href="#" onClick={() => { eventoClick('P'); }} >Pendiente</Dropdown.Item>
                                            <Dropdown.Item href="#" onClick={() => { eventoClick('O'); }} >Observado</Dropdown.Item>
                                            <Dropdown.Item href="#" onClick={() => { eventoClick('R'); }} >Rechazado</Dropdown.Item>
                                        </Dropdown.Menu>
                                    ) : null}

                                </Dropdown>
                            </div>
                        )}

                    </Item>

                    <Item
                        showColonAfterLabel={false}
                        label={{ text: intl.formatMessage({ id: "ACTION.DOWNLOAD" }) }}
                        colSpan={2}
                    >
                        {item.NombreArchivo !== "" ? (
                            <Button
                                icon="download"
                                type="default"
                                hint={item.NombreArchivo}
                                id={`gbi_${item.Index}`}
                                onClick={(e) => {
                                    e.event.preventDefault();
                                    eventoDescarga(item.Index);
                                }}
                                useSubmitBehavior={true}
                                style={{ margin: "auto", display: "table" }}
                            />
                        ) : <ImgSinAdjunto>{intl.formatMessage({ id: "ACCREDITATION.EDIT.ATTACHMENT" })}</ImgSinAdjunto>}
                    </Item>

                </GroupItem >

            </GroupItem >
        )
    } else {
        return elemento;
    }

}

export const CreateItemVacio = (item, modoEdicion, evento, esAutorizador) => {
    return <EmptyItem key={item.Index} />;
}

const itemSelector = ({ ItemValue }) => {
    // //console.log("ItemSelector", { ItemValue, id: `${ItemValue.Index}_Check` });
    if (!ItemValue) {
        // //console.log("se retorna null");
        return null;
    }
    return (
        ItemValue.DatoOpcional === "S" ? (
            <Item
                colSpan={1}
                dataField={`${ItemValue.Index}_Check`}
                editorType={"dxCheckBox"}
                cssClass={"clsDatoOpcional"}
                dataType="boolean"
                editorOptions={{ readOnly: true }}
            >
                <Label visible={false} />
            </Item>
        ) : null
    );
}


export const createItemNumber = (item, modoEdicion, evento, esAutorizador) => {

    let cols = item.NombreArchivo === "" ? 5 : 4;

    if (item.AdjuntarArchivo === 'N' || esAutorizador) {
        //let modificaSolicitante= item.TipoRequisito == "S" && item.Aprobar == 'S' ;//Puede modificar requisito Solicitante 
        //let modificaAutorizador= item.TipoRequisito == "A" && item.Aprobar == 'S' ;//Puede modificar requisito Autorizador 

        return (
            <GroupItem key={`GI_${item.Index}`} colCount={12}>
                {itemSelector({ ItemValue: item })}
                <Item
                    key={item.Index}
                    dataField={item.Index}
                    isRequired={true}
                    label={{ text: item.Text }}
                    editorType={"dxNumberBox"}
                    cssClass={`${esAutorizador && (item.Aprobar === 'S') ? "clsFondoEdit" : ""}`}
                    // visible={true}
                    editorOptions={{
                        maxLength: 200,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        //readOnly: esAutorizador ? !(modificaSolicitante || modificaAutorizador ) : !modoEdicion
                        readOnly: true
                    }}
                    colSpan={item.DatoOpcional === "S" ? 11 : 12}
                />
            </GroupItem>
        );
    } else {
        return (
            <GroupItem key={`GI_${item.Index}`} colCount={6}>
                {itemSelector({ ItemValue: item })}
                <Item
                    key={item.Index}
                    dataField={item.Index}
                    isRequired={true}
                    label={{ text: item.Text }}
                    editorType={"dxNumberBox"}
                    // visible={true}
                    editorOptions={{
                        maxLength: 200,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        readOnly: !modoEdicion
                    }}
                    colSpan={item.DatoOpcional === "S" ? cols - 1 : cols}
                />
                {createItemFile(item, modoEdicion, evento, esAutorizador)}
            </GroupItem>
        );
    }
}

export const createItemText = (item, modoEdicion, evento, esAutorizador) => {
    let cols = item.NombreArchivo === "" ? 5 : 4;
    if (item.AdjuntarArchivo === 'N' || esAutorizador) {
        return (
            <GroupItem key={`GI_${item.Index}`} colCount={12}>
                {itemSelector({ ItemValue: item })}
                <Item
                    key={item.Index}
                    dataField={item.Index}
                    isRequired={true}
                    label={{ text: item.Text }}
                    editorType={"dxTextBox"}
                    cssClass={`${esAutorizador && (item.Aprobar === 'S') ? "clsFondoEdit" : ""}`}
                    editorOptions={{
                        maxLength: 50,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        readOnly: esAutorizador ? !(item.Aprobar === 'S') : !modoEdicion
                        //readOnly: esAutorizador ? !(item.TipoRequisito == "S" && item.Aprobar == 'S' )  : !modoEdicion
                    }}
                    colSpan={item.DatoOpcional === "S" ? 11 : 12}
                />
            </GroupItem>
        );
    } else {
        return (
            <GroupItem key={`GI_${item.Index}`} colCount={6}>
                {itemSelector({ ItemValue: item })}
                <Item
                    key={item.Index}
                    dataField={item.Index}
                    isRequired={true}
                    label={{ text: item.Text }}
                    editorType={"dxTextBox"}
                    editorOptions={{
                        maxLength: 50,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        readOnly: !modoEdicion
                    }}
                    colSpan={item.DatoOpcional === "S" ? cols - 1 : cols}
                >   </Item>
                {createItemFile(item, modoEdicion, evento, esAutorizador)}
            </GroupItem>
        );
    }

}

export const createItemFileText = (item, modoEdicion, evento, esAutorizador) => {
    let cols = item.NombreArchivo === "" ? 5 : 4;
    if (item.AdjuntarArchivo === 'N' || esAutorizador) {
        return (
            <GroupItem key={`GI_${item.Index}`} colCount={12}>
                {itemSelector({ ItemValue: item })}
                <Item
                    key={item.Index}
                    dataField={item.Index}
                    isRequired={true}
                    label={{ text: item.Text }}
                    editorType={"dxTextBox"}
                    cssClass={`${esAutorizador && (item.Aprobar === 'S') ? "clsFondoEdit" : ""}`}
                    editorOptions={{
                        maxLength: 100,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        readOnly: esAutorizador ? !(item.Aprobar === 'S') : !modoEdicion
                        //readOnly: esAutorizador ? !(item.TipoRequisito == "S" && item.Aprobar == 'S' )  : !modoEdicion
                    }}
                    colSpan={item.DatoOpcional === "S" ? 11 : 12}
                />
            </GroupItem>
        );
    } else {
        return (
            <GroupItem key={`GI_${item.Index}`} colCount={6}>
                {itemSelector({ ItemValue: item })}
                <Item
                    key={item.Index}
                    dataField={item.Index}
                    isRequired={true}
                    label={{ text: item.Text }}
                    editorType={"dxTextBox"}
                    editorOptions={{
                        maxLength: 50,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        readOnly: !modoEdicion
                    }}
                    colSpan={item.DatoOpcional === "S" ? cols - 1 : cols}
                >   </Item>
                {createItemFile(item, modoEdicion, evento, esAutorizador)}
            </GroupItem>
        );
    }

}

export const createItemDate = (item, modoEdicion, evento, esAutorizador) => {

    //console.log("createItemDate|item:", item);

    let cols = item.NombreArchivo === "" ? 5 : 4;
    let itemCrear;
    if (item.AdjuntarArchivo === 'N' || esAutorizador) {
        itemCrear = (
            <GroupItem key={`GI_${item.Index}`} colCount={12}>
                {itemSelector({ ItemValue: item })}
                <Item
                    key={item.Index}
                    dataField={item.Index}
                    label={{ text: item.Text }}
                    isRequired={true}
                    editorType={"dxDateBox"}
                    dataType="datetime"
                    cssClass={`${esAutorizador && (item.Aprobar === 'S') ? "clsFondoEdit" : ""}`}
                    editorOptions={{
                        maxLength: 50,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        displayFormat: "dd/MM/yyyy",
                        //readOnly: esAutorizador ? !(item.Aprobar == 'S') : !modoEdicion,
                        readOnly: true,
                        //readOnly: esAutorizador ? !(item.TipoRequisito == "S" && item.Aprobar == 'S' )  : !modoEdicion,
                        min: new Date(new Date().toDateString())
                    }}
                    colSpan={item.DatoOpcional === "S" ? 11 : 12}
                />
            </GroupItem>
        );
    } else {
        itemCrear = (
            <GroupItem key={`GI_${item.Index}`} colCount={6}>
                {itemSelector({ ItemValue: item })}
                <Item
                    key={item.Index}
                    dataField={item.Index}
                    isRequired={true}
                    label={{ text: item.Text }}
                    editorType={"dxDateBox"}
                    dataType="datetime"
                    editorOptions={{
                        maxLength: 50,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        displayFormat: "dd/MM/yyyy",
                        //readOnly: !modoEdicion,
                        readOnly: true,
                        min: new Date(new Date().toDateString())
                    }}
                    colSpan={item.DatoOpcional === "S" ? cols - 1 : cols}
                />
                {createItemFile(item, modoEdicion, evento, esAutorizador)}
            </GroupItem>
        );
    }

    return itemCrear;
    // if (esAutorizador) {//Autorizador no adjunta archivo:
    //     return (
    //         <GroupItem key={`GIA_${item.Index}`} colCount={8}>
    //             <GroupItem colSpan={4}>
    //                 {itemCrear}
    //             </GroupItem>
    //             <GroupItem colSpan={4} colCount={4}>
    //                 <Item editorType={"dxTextBox"} colSpan={3} />
    //                 <Item editorType={"dxTextBox"} colSpan={1} />
    //             </GroupItem>

    //         </GroupItem>
    //     )
    // } else {
    //     return itemCrear;
    // }
}

export const createItemList = (item, modoEdicion, evento, esAutorizador) => {
    let cols = item.NombreArchivo === "" ? 5 : 4;
    if (item.AdjuntarArchivo === 'N' || esAutorizador) {
        return (
            <GroupItem key={`GI_${item.Index}`} colCount={12}>
                {itemSelector({ ItemValue: item })}
                <Item
                    key={item.Index}
                    dataField={item.Index}
                    isRequired={true}
                    label={{ text: item.Text }}
                    editorType="dxSelectBox"
                    cssClass={`${esAutorizador && (item.Aprobar === 'S') ? "clsFondoEdit" : ""}`}
                    editorOptions={{
                        items: item.Lista,
                        valueExpr: "IdDato",
                        displayExpr: "Dato",
                        placeholder: "Seleccione..",
                        //readOnly: esAutorizador ? !(item.Aprobar == 'S') : !modoEdicion
                        //readOnly:true
                        //readOnly: esAutorizador ? !(item.TipoRequisito == "S" && item.Aprobar == 'S' )  : !modoEdicion
                    }}
                    colSpan={item.DatoOpcional === "S" ? 11 : 12}
                />
            </GroupItem>
        );
    } else {
        return (
            <GroupItem key={`GI_${item.Index}`} colCount={6}>
                {itemSelector({ ItemValue: item })}
                <Item
                    key={item.Index}
                    dataField={item.Index}
                    isRequired={true}
                    label={{ text: item.Text }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        items: item.Lista,
                        valueExpr: "IdDato",
                        displayExpr: "Dato",
                        placeholder: "Seleccione..",
                        readOnly: true,
                        //readOnly: !modoEdicion
                    }}
                    colSpan={item.DatoOpcional === "S" ? cols - 1 : cols}
                />
                {createItemFile(item, modoEdicion, evento, esAutorizador)}
            </GroupItem>
        );
    }

}

// export const CreateItemGroup = (item, modoEdicion, evento, esAutorizador) => {

//     return (
//         <Item
//             key={`${item.Index}`}
//             colSpan={2}>
//             <AppBar
//                 position="static"
//                 className={"secundario"}
//             >
//                 <Toolbar variant="dense"
//                     className={"toolbar"}
//                 >
//                     <Typography
//                         variant="h6"
//                         color="inherit"
//                         className={"title"}
//                     >
//                         {item.Text}
//                     </Typography>
//                 </Toolbar>
//             </AppBar>
//         </Item>
//     );
// }

export const CreateItemGroup = (item, modoEdicion, evento, esAutorizador) => {

    //console.log("CreateItemGroup :::", item);
    return (
        <Item
            key={`${item.Index}`}
            colSpan={2}>
            <AppBar
                position="static"
                className={`secundario`}
            >
                <Toolbar variant="dense"
                    className={`toolbar ${(item.TipoRequisito === "S") ? "clsFondoSolicitante B" : ""}`}
                >
                    <Typography
                        variant="h6"
                        color="inherit"
                        className={`title`}
                    >
                        {item.Text}
                    </Typography>
                </Toolbar>
            </AppBar>
        </Item>
    );
}

export const createItemFile = (item, modoEdicion, evento, esAutorizador) => {
    let cols = item.NombreArchivo === "" ? 1 : 2;
    let css = item.NombreArchivo === "" ? "btn_upload_not_file" : "btn_upload_file";
    return (
        <Item
            label={{ text: "." }}
            showColonAfterLabel={false}
            key={`ifitem_${item.Index}`}
            colSpan={cols}
        >
            {!esAutorizador ? (
                <Button
                    icon="fa fa-upload"
                    type="default"
                    hint={"Subir"}
                    id={`gb_${item.Index}`}
                    className={`btn_wizard_upload ${css}`}
                    onClick={(e) => {
                        //console.log("Se hace click", e, item.Index);
                        document.getElementById(`btn_${item.Index}`).click();
                    }}
                    useSubmitBehavior={true}
                    validationGroup="FormEdicion"
                //disabled={!modoEdicion}
                //readOnly={true}
                />) : null}

            {item.NombreArchivo !== "" ? (
                <Button
                    icon="fa fa-eye"
                    type="default"
                    hint={item.NombreArchivo}
                    id={`gbi_${item.Index}`}
                    onClick={(e) => {
                        e.event.preventDefault();
                        evento(item.Index);
                    }}
                    useSubmitBehavior={true}
                //redonly={true}
                // validationGroup="FormEdicion"

                />
            ) : null}

        </Item>
    );
}
