import React, { useRef, useEffect } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Summary, TotalItem } from "devextreme-react/data-grid";
import { PortletBody } from "../../../../../partials/content/Portlet";

const MarcacionesPorZonaListPage = props => {

  const { intl } = props;
  const dataGridRef = useRef(null);

  const showColumnVehicle = (props.listaMarcacionesPV[0]) ? (props.listaMarcacionesPV[0].Tipo === "V") : false;
  const showColumnPerson = (props.listaMarcacionesPV[0]) ? (props.listaMarcacionesPV[0].Tipo === "T") : false;

  useEffect(() => {

    props.setDataGridRef(dataGridRef);

  }, []);


  return (
    <>
      <PortletBody>
        <DataGrid
          dataSource={props.listaMarcacionesPV}
          showBorders={true}
          keyExpr="RowIndex"
          ref={dataGridRef}
          allowColumnResizing={true}
          columnAutoWidth={true}
          repaintChangesOnly={true}
          scrolling={{showScrollbar: 'always'}}
          className="tablaScrollHorizontal"
        >
          <Column dataField="FechaMarca" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }) + " " + intl.formatMessage({ id: "ACCESS.PERSON.MARK" })} dataType="date" format="dd/MM/yyyy"  alignment={"center"} width={"100px"} />
          <Column dataField="FechaMarca" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })} dataType="date" format="HH:mm"  alignment={"center"} width={"80px"} />

          {/* Si es persona */}
          <Column dataField="NombreCompleto" visible={showColumnPerson} caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}  width={"250px"}  />

          <Column dataField="TipoDocumentoAlias" visible={showColumnPerson} caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })} alignment={"center"} width={"70px"} />
          <Column dataField="Documento" visible={showColumnPerson} caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"100px"} alignment={"center"}  />
           {/* Si es vehiculo */}
          <Column dataField="Placa" visible={showColumnVehicle} caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.LICENSEPLATE" })} alignment={"center"} with={"200px"}  />
          <Column dataField="Chofer" visible={showColumnVehicle} caption={intl.formatMessage({ id: "ACCESS.VEHICLE.MARK.DRIVER" })} width={"150px"} />

          <Column dataField="TipoMarcacion" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.RESULT" })} alignment={"center"} width={"120px"} />
          <Column dataField="Compania" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.COMPANY" })} width={"250px"}  />
          <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT.UO" })} width={"200px"} /> 

           <Column dataField="Zona" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.ZONE" })} alignment={"center"} width={"150px"}/> 
          <Column dataField="Puerta" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.DOOR" })} alignment={"center"} width={"200px"} />
          <Column dataField="Funcion" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.FUNCTION" })} alignment={"center"} width={"100"} />
          <Column dataField="Equipo" caption={intl.formatMessage({ id: "ACCESS.DOOR.EQUIPMENT.EQUIPMENT" })} alignment={"center"} width={"200px"}/> 
          <Column dataField="Motivo" caption={intl.formatMessage({ id: "ACCESS.PERSON.REASON" })} alignment={"center"} width={"200px"} visible={props.dataRowEditNew.TipoAcceso === "N" ? true :false} /> 
     
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="FechaMarca"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>

        </DataGrid>
      </PortletBody>
    </>
  );
};

export default injectIntl(MarcacionesPorZonaListPage);
