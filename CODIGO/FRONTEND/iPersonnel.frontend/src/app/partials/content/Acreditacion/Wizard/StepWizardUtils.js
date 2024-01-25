import styled from '@emotion/styled';

export const StatusDescription = {
  I: "COMMON.INCOMPLETE",
  P: "COMMON.EARRING",
  O: "COMMON.OBSERVED",
  R: "COMMON.REJECTED",
  A: "COMMON.APPROVED",
};

export const getStatusDescription = (Status) => {

  return StatusDescription[Status] !== undefined ?
    StatusDescription[Status] :
    "COMMON.INCOMPLETE"
}

export const DivObservation = styled.div`
  text-transform: uppercase;
  font-weight: bold;
  margin-top: 1px;
  margin-left: 20px;
  border: solid 1px red;
  border-radius: 5px;
  color: red;
  padding-bottom: 10px;
  padding-top: 10px;
  padding-left: 5px;
  padding-right: 5px; 
`;

export const DivStepFooter = styled.div`
  margin-top: 25px;
  margin-bottom: 10px;
  border-top: solid;
  border-top-color: rgba(128, 128, 128, 0.5);
  border-top-width: 1px;
  padding-top: 10px; 
`;

export const DivEstadoGeneral = styled.div`
  font-family: "Helvetica Neue", "Segoe UI", Helvetica, Verdana, sans-serif;
  width: 100%;
  height: 100%;
  display: flex;
  height:auto;
`;

export const DivTitleEstadoBar = styled.div`
  font-size: 15px;
  font-family: "Helvetica Neue", "Segoe UI", Helvetica, Verdana, sans-serif;
  text-transform: uppercase;
  font-weight: bold;
  height: auto;
  margin-top: auto;
  margin-bottom: auto;
`;

export const DivTitleNewRecord = styled.div`
  font-family: "Helvetica Neue", "Segoe UI", Helvetica, Verdana, sans-serif;
  width: 100%; 
  display: flex; 
  font-size: 15px; 
  text-transform: uppercase;
  font-weight: bold;
  height: auto;
  margin-top: auto;
  margin-bottom: auto;
`;

export const SpanStatus = styled.span`
  margin-left: 20px;
  margin-top: auto;
  margin-bottom: auto; 
  padding: 3px 10px 3px 10px;
  text-align: center;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold; 
  color: ${props => (props.Estado === "O" ? "black !important" : "white")};
  background-color:${props => props.Estado === "I" ? "rgb(167, 167, 167)" :
    props.Estado === "P" ? "#ff7f2a" :
      props.Estado === "O" ? "#ffd400" :
        props.Estado === "R" ? "#970e00" :
          props.Estado === "A" ? "green" : "rgb(167, 167, 167)"
  };
`;

export const DivStepHeader = styled.div`
    cursor:${props => (props.ENABLEHEADER ? "pointer" : "no-drop")};
`;

export const DivStepVisible = styled.div`
  display:${props => (props.visible ? "inherit" : "none")};
`;