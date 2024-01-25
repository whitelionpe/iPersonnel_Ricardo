import React, { Fragment, useState, useEffect } from 'react';
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../../../partials/content/withLoandingPanel";

import { PortletBody } from "../../../../../../../partials/content/Portlet";
import { withRouter } from 'react-router-dom';

import RequestStructure from "../../../../../../../partials/content/Acreditacion/RequestStructure/RequestStructure";
import VisitaProgramacionPage from "./VisitaProgramacionPage";
import VisitaPersonaPage from "./VisitaPersonaPage";
//import VisitaRequisitosPage from "./VisitaRequisitosPage";

const DetalleEditPage = (props) => {

  const { intl,
    visitas,
    setVisitas,
    requisitos,
    personasRequisitos,
    setDataRowEditNew,
    setpersonasRequisitos,
    dataRowEditNew = {},
    modoEdicion = false, setLoading,
    centrosCostos,
    unidadesOrganizativas,
    perfilesAcreditacion,
    companias,
    tipoDocumentos,
    sexoSimple,
    configuracionPeso,
    eventViewPdf

  } = props;


  const [formControlPersona, setFormControlPersona] = useState(null);
  const [formControlRequisito, setFormControlRequisito] = useState(null);
  const [viewCardVisita, setViewCardVisita] = useState(false);
  const stepEnableButton = 2;
  const [headerDataVisits, setHeaderDataVisits] = useState([]);
  const [headerDataRequeriments, setHeaderDataRequeriments] = useState([]);

  const steps = [
    {
      id: "programacion",
      title: intl.formatMessage({ id: "ACCREDITATION.VISIT.TAB1" })
    },
    {
      id: "personas",
      title: intl.formatMessage({ id: "ACCREDITATION.VISIT.TAB2" })
    },
    // {
    //   id: "requisitos",
    //   title: intl.formatMessage({ id: "ACCREDITATION.VISIT.TAB3" })
    // }
  ];
  const [formControlProgramacion, setFormControlProgramacion] = useState(null);


  useEffect(() => {


    if (visitas.length > 0) {

      if (headerDataVisits.length === 0) {

        setHeaderDataVisits(
          visitas.map(x => ({
            id: `${x.Documento}`,
            nombre: () => (
              <>
                {x.TipoDocumento}
                <br />
                {x.Documento}
              </>
            ),
            buttonDelete: false,
            icon: ""
          }))
        );
      }

      if (headerDataRequeriments.length === 0) {
        setHeaderDataRequeriments(
          visitas.map(x => ({
            id: `${x.Documento}`,
            nombre: () => <span title="Requisitos"> {x.Documento} </span>,
            buttonDelete: false,
            icon: "dx-icon-folder"
          }))
        );
      }

    }

  }, [visitas]);

  return (
    <Fragment>
      <div className="row" style={{ width: "100%" }}>
        <div className="col-12">

          <PortletBody>
            <div>

              <RequestStructure
                steps={steps}
                dataRowEditNew={props.dataRowEditNew}
                CompanyName={""}
                DivisionName={""}//perfil.Division 
                isEditMode={false}
                stepEnableButton={stepEnableButton}
                //eventSaveProgress={guardarAvance}
                eventCancelEdit={props.eventRetornar}
                validateFormDataByStepNumber={() => ({ isValidate: true, message: "" })}
                eventReturnHome={props.eventRetornar}
                setLoading={setLoading}
                //Metodos agregados para validar el boton agregar
                // viewAdd={props.modoEdicion && props.dataRowEditNew.esNuevoRegistro}
                //activeButtonAdd={1}
                eventAdd={""}
              >

                <VisitaProgramacionPage
                  formControl={formControlProgramacion}
                  setFormControl={setFormControlProgramacion}
                  dataRowEditNew={dataRowEditNew}
                  setDataRowEditNew={setDataRowEditNew}


                  centrosCostos={centrosCostos}
                  unidadesOrganizativas={unidadesOrganizativas}
                  perfilesAcreditacion={perfilesAcreditacion}
                  companias={companias}
                  modoEdicion={false}
                /*loadDataByPerfil={loadDataByPerfil}
                loadCentroCostoByUnidadOrganizativa={
                  loadCentroCostoByUnidadOrganizativa
                } */
                //onValueChangedCompany={onValueChangedCompany}
                //setCompania={setCompania} 
                //intl={intl}
                //setLoading={setLoading}

                />

                <VisitaPersonaPage
                  formControl={formControlPersona}
                  setFormControl={setFormControlPersona}
                  dataRowEditNew={dataRowEditNew}
                  //intl={intl}
                  tipoDocumentos={tipoDocumentos}
                  sexoSimple={sexoSimple}
                  modoEdicion={false}
                  visitas={visitas}
                  setVisitas={setVisitas}
                  eventViewPdf={eventViewPdf}

                  requisitos={requisitos}
                  personasRequisitos={personasRequisitos}

                  setpersonasRequisitos={setpersonasRequisitos}
                  viewCardVisita={viewCardVisita}
                  setViewCardVisita={setViewCardVisita}

                  headerDataVisits={headerDataVisits}
                  setHeaderDataVisits={setHeaderDataVisits}
                  setHeaderDataRequeriments={setHeaderDataRequeriments}

                />

                {/* <VisitaRequisitosPage
                  formControl={formControlRequisito}
                  setFormControl={setFormControlRequisito}
                  dataRowEditNew={dataRowEditNew}
                  intl={intl}
                  setLoading={setLoading}
                  modoEdicion={modoEdicion}
                  requisitos={requisitos}
                  visitas={visitas}
                  personasRequisitos={personasRequisitos}
                  setpersonasRequisitos={setpersonasRequisitos}
                  //headerDataVisits={headerDataRequeriments}
                  //setHeaderDataVisits={setHeaderDataRequeriments}
                  headerDataRequeriments={headerDataRequeriments}
                  configuracionPeso={configuracionPeso}
                /> */}

              </RequestStructure>
            </div>

          </PortletBody>

        </div>
      </div>
    </Fragment>
  );
};

export default injectIntl(WithLoandingPanel(withRouter(DetalleEditPage)));
