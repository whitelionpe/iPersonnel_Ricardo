import {injectIntl} from "react-intl";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import React, {useState} from "react";
import {dateFormat, isNotEmpty} from "../../../../../../_metronic";
import Form, {GroupItem, Item} from "devextreme-react/form";
import Constants from "../../../../../store/config/Constants";
import {PortletBody, PortletHeader, PortletHeaderToolbar} from "../../../../../partials/content/Portlet";
import {Button} from "devextreme-react";
import TransporteRutaBuscar from "../../../../../partials/components/transporte/popUps/TransporteRutaBuscar";

const ManifiestoFinalFilterPage = (props) => {
  const { intl, setLoading, dataRowEditNew } = props;
  const [viewFilter, setViewFilter] = useState(true);
  const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: "" });

  const [popUpVisibleRuta, setpopUpVisibleRuta] = useState(false);

  const clearRefresh = () => {
    props.setDataRowEditNew({
      Fecha: '',
      Ruta: '',
      IdRuta: ''
    });

    props.clearDataGrid();
  }

  const getFiltrar = (e) => {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      let filtro = {
        Fecha: dateFormat(dataRowEditNew.Fecha, 'yyyyMMdd'),
        IdRuta: isNotEmpty(dataRowEditNew.IdRuta) ? dataRowEditNew.IdRuta : "",
      }

      props.filtrarReporte(filtro);
    }
  }

  const hideFilter = () => {
    let form = document.getElementById("FormFilter");
    if (viewFilter) {
      setViewFilter(false);
      form.classList.add('hidden');
    } else {
      form.classList.remove('hidden');
      setViewFilter(true);
    }
  }

  const selectRuta = async (datos) => {
    const { IdRuta, Ruta, Origen,Destino } = datos[0];
    dataRowEditNew.IdRuta = IdRuta;
    dataRowEditNew.Ruta = Ruta;
    dataRowEditNew.Origen = Origen;
    dataRowEditNew.Destino = Destino;
    setpopUpVisibleRuta(false);
  };

  const filtrosGenerales = (e) => {
    return (
      <Form formData={dataRowEditNew} validationGroup="FormEdicion">
        <GroupItem itemType="group" colCount={2}>

          <Item dataField="IdRuta" visible={false} />

          <Item
            dataField="Fecha"
            label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" }) }}
            isRequired={true}
            editorType="dxDateBox"
            editorOptions={{
              type: "date",
              showClearButton: true,
              displayFormat: "dd/MM/yyyy HH:mm",
            }}
          />

          <Item
            dataField="Ruta"
            with="50"
            label={{ text: intl.formatMessage({ id: "TRANSPORTE.ROUTE" }) }}
            editorOptions={{
              readOnly: true,
              inputAttr: { 'style': 'text-transform: uppercase' },
              buttons: [{
                name: 'search',
                location: 'after',
                useSubmitBehavior: true,
                readOnly: false,
                options: {
                  stylingMode: 'text',
                  icon: 'search',
                  disabled:false,
                  onClick: () => {
                    setpopUpVisibleRuta(true);
                  }
                }
              }]
            }}
          />

        </GroupItem>
      </Form>
    );
  }

  return (
    <>
      <PortletHeader
        title={""}
        toolbar={
          <PortletHeaderToolbar>

            <Button icon={viewFilter ? "chevronup" : "chevrondown"}
                    type="default"
                    hint={viewFilter ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
                    onClick={hideFilter} />
            &nbsp;
            <Button
              icon="fa fa-search"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.FILTER" })}
              onClick={getFiltrar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />

            &nbsp;
            <Button icon="refresh"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    onClick={clearRefresh} />

            &nbsp;
            <Button
              icon="fa fa-file-excel"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
              onClick={props.exportReport}
            />

          </PortletHeaderToolbar>

        }
      />
      <PortletBody>
        <Form id="FormFilter" formData={dataRowEditNew} validationGroup="FormEdicion" >
          <GroupItem itemType="group" colCount={2} colSpan={2}>

            <div className="row">

              <div className="col-md-12">
                <fieldset className="scheduler-border">
                  <legend className="scheduler-border"><h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5></legend>
                  { filtrosGenerales() }
                </fieldset>
              </div>

            </div>

          </GroupItem>
        </Form>
      </PortletBody>

      {popUpVisibleRuta && (
        <TransporteRutaBuscar
          selectData={selectRuta}
          showPopup={{ isVisiblePopUp: popUpVisibleRuta, setisVisiblePopUp: setpopUpVisibleRuta }}
          cancelarEdicion={() => setpopUpVisibleRuta(false)}
          uniqueId={"TransporteRutaBuscarReporteManifiestoReporte001"}
          showButton={true}
        />
      )}
    </>
  );

}

export default injectIntl(WithLoandingPanel(ManifiestoFinalFilterPage));
