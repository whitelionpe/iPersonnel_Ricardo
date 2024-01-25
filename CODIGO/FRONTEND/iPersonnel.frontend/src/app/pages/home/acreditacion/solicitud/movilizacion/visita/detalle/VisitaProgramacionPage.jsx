import React, {
  Fragment,
  //useState
} from "react";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { useStylesEncabezado } from "../../../../../../../store/config/Styles";
import { injectIntl } from "react-intl";

import TextBoxItem from "../../../../../../../partials/content/Acreditacion/Inputs/TextBox";
//import ListBoxItem from "../../../../../../../partials/content/Acreditacion/Inputs/ListBox";
import DateBoxItem from "../../../../../../../partials/content/Acreditacion/Inputs/DateBox";
import ValidationGroup from "devextreme-react/validation-group";

import TextArea from "devextreme-react/text-area";
const VisitaProgramacionPage = (props) => {

  const { intl, dataRowEditNew, modoEdicion, formControl, setFormControl } = props;
  const classesEncabezado = useStylesEncabezado();
  // const [diasMaximos, setDiasMaximos] = useState(0);
  // const [rangoFecha, setRangoFecha] = useState({
  //   FechaInicio: new Date(),
  //   FechaFin: new Date(2050, 1, 1)
  // });


  return (
    <Fragment>
      <div>
        <div className="row" style={{ paddingBottom: "20px" }}>
          <AppBar position="static" className={classesEncabezado.secundario}>
            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
              <Typography
                variant="h6"
                color="inherit"
                className={classesEncabezado.title}
              >
                {intl.formatMessage({ id: "ACCREDITATION.VISIT.TAB1" }).toUpperCase()}
              </Typography>
            </Toolbar>
          </AppBar>
        </div>
        <ValidationGroup
          name="validarEmpresa"
          onInitialized={e => {
            if (e.component !== null && formControl === null) {
              setFormControl(e.component);
            }
          }}
        >
          <div className="row">
            <TextBoxItem
              label={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY" })}
              name="CompaniaMandante"
              elements={dataRowEditNew}
              //isRequired={true}
              readOnly={!modoEdicion}
            //isTextButton={true}
            />

            <TextBoxItem
              label={intl.formatMessage({ id: "ADMINISTRATION.VISIT.RESPONSIBLEFORVISIT" })}
              name="NombreCompleto"
              elements={dataRowEditNew}
              // isRequired={true}
              readOnly={!modoEdicion}
            />
          </div>

          <div className="row">

            <TextBoxItem
              label={intl.formatMessage({ id: "ACCESS.PROFILE" })}
              name="Perfil"
              elements={dataRowEditNew}
              // isRequired={true}
              readOnly={!modoEdicion}
            />

            <TextBoxItem
              label={intl.formatMessage({ id: "ACCESS.PROFILE" })}
              name="DescripcionPerfil"
              elements={dataRowEditNew}
              //  isRequired={false}
              textOnly={true}
              readOnly={!modoEdicion}
            />
          </div>

          <div className="row">
            <TextBoxItem
              label={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" })}
              name="UnidadOrganizativa"
              elements={dataRowEditNew}
              //isRequired={true}
              readOnly={!modoEdicion}
            //isTextButton={true}
            />
            <TextBoxItem
              label={intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.COSTCENTER" })}
              name="CentroCosto"
              elements={dataRowEditNew}
              //isRequired={true}
              readOnly={!modoEdicion}
            />
          </div>

          <div className="row">
            <DateBoxItem
              label={intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" })}
              name="FechaInicio"
              elements={dataRowEditNew}
              //isRequired={true}
              min={dataRowEditNew.FechaInicio}
              //max={rangoFecha.FechaFin}
              readOnly={!modoEdicion}
            />

            <DateBoxItem
              label={intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" })}
              name="FechaFin"
              elements={dataRowEditNew}
              //isRequired={true}
              min={dataRowEditNew.FechaFin}
              //max={rangoFecha.FechaFin}
              readOnly={!modoEdicion}
            />
          </div>

          <div className="row">
            <div className="col-6">
              <div className="dx-field">
                <div className="dx-field-label">
                  <span className="dx-field-item-label-text">{"Motivo"}:</span>
                  {/* <span className="dx-field-item-required-mark">&nbsp;*</span> */}
                </div>
                <div className="dx-field-value">
                  <TextArea
                    height={70}
                    value={dataRowEditNew.Motivo}
                    valueChangeEvent={"change"}
                    maxLength={500}
                    // onValueChanged={e => {
                    //   setDataRowEditNew(prev => ({ ...prev, Motivo: e.value }));
                    // }}
                    readOnly={!modoEdicion}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">

            </div>
          </div>
        </ValidationGroup>


      </div>

    </Fragment>
  );
};

export default injectIntl(VisitaProgramacionPage);
