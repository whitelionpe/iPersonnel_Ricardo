import React, { useEffect, useState, useCallback } from "react";
import { injectIntl } from "react-intl";
import { excelformato } from "../../../../api/casino/marcacion.api";
import { listarPorCliente } from "../../../../api/casino/comedor.api";

import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import { SelectBox } from 'devextreme-react/select-box';
import {handleErrorMessages, handleWarningMessages} from "../../../../store/ducks/notify-messages";


const MarcaMasivoDatos = ({ IdDivision }) => {
  const [idComedorActual, setIdComedorActual] = useState(null);
  const [comedores, setComedores] = useState([]);

    const descargarFormatoExcel = async (e) => {
      if(idComedorActual !== null) {
        await excelformato({IdDivision, IdComedor: idComedorActual})
          .then(resp => {
            if (resp.error === 0) {
              let temp = `data:application/vnd.ms-excel;base64,${encodeURIComponent(resp.fileBase64)}`;
              let download = document.getElementById('iddescargaformato');
              download.href = temp;
              download.download = `${resp.nombre}.xlsx`;
              download.click();
            }
          })
          .catch(err => {
            handleErrorMessages("Debe seleccionar un Comedor", err);
          })
      }
      else{
        handleWarningMessages("Advertencia", "Debe seleccionar un Comedor");

      }
    };

  async function llenarCombosComedores(){
    await listarPorCliente({ IdCliente : "4"})
      .then(resp =>{
        console.log(resp);
        setComedores(resp);
      });
  }

  const onValueChanged = useCallback((e) => {
    //console.log(e.previousValue);
    console.log(e.value);
    setIdComedorActual(e.value);
  }, []);

  useEffect(() => {
    llenarCombosComedores();
  }, []);

    return (
        <>
            <a id="iddescargaformato" href='#id' />
            <div className="row" style={{ paddingBottom: "20px" }}>
                <div className="col-12">
                    <div className="card">
                        <div className="card-header barra-titulo">
                            Proceso de carga masiva
                        </div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item card-custom-masivo">
                                <div className="row">
                                    <div className="col-6">
                                        <h5 className="card-title">1° Descargar la plantilla</h5>
                                        <p className="card-text">Descargue el documento Excel para poder ingresar los datos de las marcaciones.</p>

                                    </div>
                                    <div className="col-3">
                                      <SelectBox
                                        placeholder="---SELECCIONE UN COMEDOR---"
                                        onValueChanged={onValueChanged}
                                        dataSource={comedores}
                                        valueExpr="IdComedor"
                                        displayExpr="Comedor"
                                      />
                                    </div>
                                    <div className="col-3">
                                        <input type="button" className="btn btn-primary classCerrarSesion" value="Descargar" onClick={descargarFormatoExcel} />
                                    </div>
                                </div>
                            </li>
                            <li className="list-group-item card-custom-masivo">
                                <div className="row" >
                                    <div className="col-12">
                                        <h5 className="card-title">2° Subir plantilla</h5>
                                        <p className="card-text">Seleccione el documento Excel para poder subir el archivo.</p>

                                        <div className="mb-3">
                                            <input className="form-control " style={{ width: "80%" }} type="file"  id="btn_Excel_0001" accept={'.xls, .xlsx'} />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
};

export default injectIntl(WithLoandingPanel(MarcaMasivoDatos));
