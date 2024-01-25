import React, { useState, useEffect } from "react";
import { Grid, Row, Col } from 'react-flexbox-grid';

const Summary = ({
  data: { 
    IdModulo, 
    Modulo, 
    TipoModulo, 
  }
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <Grid className="modulo-summary">
      <Row>
        <Col xs>
          <div>
            <div className="kt-widget1">
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info">
                  <h3 className="kt-widget1__title text-dark font-weight-bold">Habitaciones</h3>
                </div>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info">
                  <span className="kt-widget1__desc kt-font-linkedin font-weight-bold">Total</span>
                </div>
                <span className="kt-widget1__number kt-font-linkedin font-weight-bold">200</span>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info">
                  <span className="kt-widget1__desc level-1 kt-font-facebook">Activas</span>
                </div>
                <span className="kt-widget1__number kt-font-facebook">191</span>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info level-2">
                  <span className="kt-widget1__desc kt-font-success">Libres</span>
                </div>
                <span className="kt-widget1__number kt-font-success">78</span>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info level-2">
                  <span className="kt-widget1__desc kt-font-twitter">Reservadas</span>
                </div>
                <span className="kt-widget1__number kt-font-twitter">15</span>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info level-2">
                  <span className="kt-widget1__desc kt-font-warning">Ocupadas</span>
                </div>
                <span className="kt-widget1__number kt-font-warning">98</span>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info">
                  <span className="kt-widget1__desc level-1 kt-font-danger">Inactivas</span>
                </div>
                <span className="kt-widget1__number kt-font-danger">9</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs>
          <div>
            <div className="kt-widget1">
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info">
                  <h3 className="kt-widget1__title text-dark font-weight-bold">Camas</h3>
                </div>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info">
                  <span className="kt-widget1__desc kt-font-linkedin font-weight-bold">Total</span>
                </div>
                <span className="kt-widget1__number kt-font-linkedin font-weight-bold">2300</span>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info">
                  <span className="kt-widget1__desc level-1 kt-font-facebook">Activas</span>
                </div>
                <span className="kt-widget1__number kt-font-facebook">2283</span>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info level-2">
                  <span className="kt-widget1__desc kt-font-success">Libres</span>
                </div>
                <span className="kt-widget1__number kt-font-success">933</span>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info level-2">
                  <span className="kt-widget1__desc kt-font-twitter">Resevadas</span>
                </div>
                <span className="kt-widget1__number kt-font-twitter">179</span>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info level-2">
                  <span className="kt-widget1__desc kt-font-warning">Ocupadas</span>
                </div>
                <span className="kt-widget1__number kt-font-warning">1171</span>
              </div>
              <div className="kt-widget1__item ng-star-inserted">
                <div className="kt-widget1__info">
                  <span className="kt-widget1__desc level-1 kt-font-danger">Inactivas</span>
                </div>
                <span className="kt-widget1__number kt-font-danger">17</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Grid>
  );
  // --------------------------------------------------------------------
};

export default Summary;