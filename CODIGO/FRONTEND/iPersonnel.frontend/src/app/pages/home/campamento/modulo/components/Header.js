import React, { useEffect, useState } from "react";
import { Grid, Row, Col } from 'react-flexbox-grid';

import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import { Button } from "devextreme-react";
import Pagination from "react-bootstrap-4-pagination";
import { isFunction, isSet } from "../../../../../partials/shared/CommonHelper";
import Toolbar from "@material-ui/core/Toolbar";

const Header = ({
  data: usrData,
  currentPage: usrCurrentPage,
  totalPages: usrTotalPages,
  onChangePage: usrOnChangePage,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const originalShowMax = 5;
  const [data, setData] = useState();
  const [currentPage, setCurrentPage] = useState(usrCurrentPage);
  const [totalPages, setTotalPages] = useState(usrTotalPages);
  const [showMax, setShowMax] = useState(originalShowMax);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const getInfo = () => {
    const { IdModulo, Modulo, TipoModulo, Nivel } = usrData || {};
    return [
      { text: 'Código', value: IdModulo },
      { text: 'Módulo', value: Modulo },
      { text: 'Tipo', value: TipoModulo },
      { text: 'Piso', value: Nivel },
    ];
  }
  const calculateAdjustmentForShowMaxButtonsForPagination = (page) => {
    setCurrentPage(page);
    let newShowMax = totalPages - page >= Math.floor(originalShowMax/2) ? originalShowMax : totalPages - page + 1;
    newShowMax = newShowMax > 3 ? newShowMax : 3;
    if (page === totalPages) newShowMax = 2;
    if (showMax !== newShowMax) setShowMax(newShowMax);
  }
  const onChangePage = page => {
    usrOnChangePage(page);
  }
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const performOnAfterChangedUsrData = () => setData(getInfo());  
  const performOnAfterChangedCurrentPage = () => calculateAdjustmentForShowMaxButtonsForPagination(currentPage);
  const performOnAfterChangedUsrCurrentPage = () => setCurrentPage(usrCurrentPage);
  const performOnAfterChangedUsrTotalPages = () => setTotalPages(usrTotalPages);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(performOnAfterChangedUsrData, [usrData]);

  
  useEffect(performOnAfterChangedCurrentPage, [currentPage]);
  useEffect(performOnAfterChangedUsrCurrentPage, [usrCurrentPage]);
  useEffect(performOnAfterChangedUsrTotalPages, [usrTotalPages]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        <Grid fluid className="modulo-hi">
          <Row middle="xs">
            <Col xs={1} className="border-r">
              <div className="title">
                <h4>Módulo</h4>
              </div>
            </Col>
            <Col xs={8} className="border-r">
              <HeaderInformation visible={true}
                labelLocation={'left'} 
                data={data}
                cssClass="modulo-hi-info"
              />
            </Col>
            <Col xs={2} className="border-r">
              {
                isSet(currentPage) && isSet(totalPages) && isFunction(onChangePage) && 
                <div className="vcg-wrapper-pagination">
                  <Pagination threeDots
                    prevNext
                    shadow={false}
                    prevNext={false}
                    size="md"
                    totalPages={totalPages}
                    showMax={showMax}
                    color="#337ab7"
                    activeBgColor="#337ab7"
                    activeBorderColor="#164873"
                    currentPage={currentPage}
                    onClick={onChangePage}
                  />
                </div>
              }
            </Col>
            <Col xs={1}>
              <Toolbar variant="dense" className="modulo-hn-t">
                <Button icon="fas fa-layer-group" hint="Crear Piso" onClick={console.log} />
              </Toolbar>
            </Col>
          </Row>
        </Grid>
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default Header;