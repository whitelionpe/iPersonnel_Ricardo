import axios from "axios";
import Constants from "../../store/config/Constants";
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = Constants.API_URL + "/api/AsistenciaReporte";

//=============== PERSONAL SIN HORARIO ==============================================
export const filtrarPersonalSinHorario = `${URL}/rpt_001_PersonalSinHorario`;
export function exportarPersonalSinHorario(params) {
  return from(axios.get(`${URL}/rpt_001_PersonalSinHorarioExport`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//=============== PERSONAL CON HORARIO ==============================================
export const filtrarPersonalConHorario = `${URL}/rpt_002_PersonalConHorario`;
export function exportarPersonalConHorario(params) {
  return from(axios.post(`${URL}/rpt_002_PersonalConHorarioExport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//=============== PERSONAL CON MARCAS ==============================================
export const filtrarPersonalMarcas = `${URL}/rpt_003_PersonalMarcas`;
export function exportarPersonalMarcas(params) {
  return from(axios.get(`${URL}/rpt_003_PersonalMarcasExport`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//===============[04]> PERSONAL CON TIEMPO ADICIONAL ==============================================
export const filtrarPersonalTiempoAdicional = `${URL}/rpt_004_PersonalTiempoAdicional`;

export function exportarPersonalTiempoAdicional(params) {
  return from(axios.post(`${URL}/rpt_004_PersonalTiempoAdicionalExport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
export function personalTiempoAdicional(params) {
  return from(axios.get(`${URL}/rpt_004_PersonalTiempoAdicional`, {params})).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//===============[05]> ASISTENCIA PERSONAL ==============================================
export const filtrarPersonalAsistencia = `${URL}/rpt_005_AsistenciaPersonal`;
export function exportarPersonalAsistencia(params) {
  return from(axios.post(`${URL}/rpt_005_AsistenciaPersonalExport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//===============[06]> RESULTADO CALCULO ASISTENCIA ==============================================
export const filtrarResultadoCalculoAsistencia = `${URL}/rpt_006_CalculoAsistencia`;
export function exportarResultadoCalculoAsistencia(params) {
  return from(axios.post(`${URL}/rpt_006_CalculoAsistenciaExport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//---CalculoBonoNocturno
//===============[07]> CALCULO BONO NOCTURNO ==============================================
export const filtrarCalculoBonoNocturno = `${URL}/rpt_007_CalculoBonoNocturno`;
// export const  = `${URL}/rpt_007_CalculoBonoNocturnoDetalle`;

export function filtrarCalculoBonoNocturnoDetalle(params) {
  return from(axios.get(`${URL}/rpt_007_CalculoBonoNocturnoDetalle`, { params })).pipe(
      map(result => result.data.result)
  ).toPromise();
} 
export function exportarCalculoBonoNocturno(params) {
  return from(axios.post(`${URL}/rpt_007_CalculoBonoNocturnoExport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//===============[08]> Horas extra Aprobadas ==============================================

export function exportarHorasExtrasAprobadas(params) {
  return from(axios.post(`${URL}/rpt_008_HorasExtrasAprobadasExport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
export function horasExtrasAprobadas(params) {
  return from(axios.get(`${URL}/rpt_008_HorasExtrasAprobadas`, {params})).pipe(
    map(result => result.data.result)
  ).toPromise();
}
 
//===============[09]> Bolsa de horas ==============================================

export function exportarBolsaHoras(params) {
  return from(axios.post(`${URL}/rpt_009_BolsaHorasExport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
export function filtrarBolsaHoras(params) {
  return from(axios.get(`${URL}/rpt_009_BolsaHoras`, {params})).pipe(
    map(result => result.data.result)
  ).toPromise();
}
 
 
//=============== REPORTE INCIDENCIA ==============================================
   
export const filtrarIncidenciaAsistencia = `${URL}/rpt_010_AsistenciaIncidencia`;

export function exportarIncidenciaAsistencia(params) {
  return from(axios.post(`${URL}/rpt_010_AsistenciaIncidenciaExport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
} 
export function incidenciaAsistencia(params) {
  return from(axios.post(`${URL}/rpt_010_AsistenciaIncidencia`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}



//===============[11]> EMPLEADOS ==============================================
export const filtrarEmpleados = `${URL}/rpt_011_Empleados`;
export function exportarEmpleados(params) {
  return from(axios.post(`${URL}/rpt_011_EmpleadosExport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
 

//=============== REPORTE JUSTIFICACION ==============================================
   
export const filtrarJustificacionAsistencia = `${URL}/rpt_012_AsistenciaJustificacion`;

export function exportarJustificacionAsistencia(params) {
  return from(axios.post(`${URL}/rpt_012_AsistenciaJustificacionExport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
} 
export function justificacionAsistencia(params) {
  return from(axios.post(`${URL}/rpt_012_AsistenciaJustificacion`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}


//=============== [13] REPORTE CONFIGURACION HORARIO ==============================================
   
export const filtrarHorarioConfiguracionAsistencia = `${URL}/rpt_013_ConfiguracionHorario`;

export function exportarHorarioConfiguracionAsistencia(params) {
  return from(axios.post(`${URL}/rpt_013_ConfiguracionHorarioExport`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
} 
export function horarioConfiguracionAsistencia(params) {
  return from(axios.post(`${URL}/rpt_013_ConfiguracionHorario`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}


//=============== [15] REPORTE GRUPOS MARCACION ==============================================
    
export function ListarAsistenciaReporte015ListarPersonaXGrupo(params) {
  return from(axios.get(`${URL}/listarAsistenciaReporte015ListarPersonaXGrupo`, {params})).pipe(
    map(result => result.data.result)
  ).toPromise();
} 
 
export function ExportarAsistenciaReporte015ListarPersonaXGrupo(params) {
  return from(axios.post(`${URL}/exportarAsistenciaReporte015ListarPersonaXGrupo`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
} 



//=============== [16] REPORTE HHEE RITINSA ==============================================

export function ListarAsistenciaReporte016ListarHHEERITINSA(params) {
  return from(axios.get(`${URL}/ListarAsistenciaReporte016ListarHHEERITINSA`, {params})).pipe(
    map(result => result.data.result)
  ).toPromise();
} 
 
export function ExportarAsistenciaReporte016ListarHHEERITINSA(params) {
  return from(axios.post(`${URL}/exportarAsistenciaReporte016ListarHHEERITINSA`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
} 

 
//=============== [17] REPORTE SUNAFIL ==============================================

export function ListarAsistenciaReporte017Sunafil(params) {
  return from(axios.get(`${URL}/ListarAsistenciaReporte017ListarSunafil`, {params})).pipe(
    map(result => result.data.result)
  ).toPromise();
}  
 
export function ExportarAsistenciaReporte017Sunafil(params) {
  return from(axios.post(`${URL}/exportarAsistenciaReporte017ListarSunafil`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
} 
 