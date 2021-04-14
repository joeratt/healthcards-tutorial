(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var patient = smart.patient;
        var patientId = patient.id;
        // var pt = patient.read();
        // var obv = smart.patient.api.fetch({
        //             type: 'Observation',
        //             query: {
        //               code: {
        //                 $or: ['http://loinc.org|8302-2', 'http://loinc.org|8462-4',
        //                       'http://loinc.org|8480-6', 'http://loinc.org|2085-9',
        //                       'http://loinc.org|2089-1', 'http://loinc.org|55284-4']
        //               }
        //             }
        //           });

        var hc = smart.request({
          url: 'Patient/' + patientId + '/$health-cards-issue',
          body: { 
            "resourceType": "Parameters",
            "parameter": [
              {
                "name": "credentialType",
                "valueUri": "https://smarthealth.cards#covid19"
              },
              {
                "name": "credentialType",
                "valueUri": "https://smarthealth.cards#immnization"
              }
            ]
          }

        })

        $.when(hc, obv).fail(onError);

        $.when(hc, obv).done(function(patient, hc) {
          
          console.log(hc);
          ret.resolve(defaultPatient());
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
      systolicbp: {value: ''},
      diastolicbp: {value: ''},
      ldl: {value: ''},
      hdl: {value: ''},
    };
  }

  function getBloodPressureValue(BPObservations, typeOfPressure) {
    var formattedBPObservations = [];
    BPObservations.forEach(function(observation){
      var BP = observation.component.find(function(component){
        return component.code.coding.find(function(coding) {
          return coding.code == typeOfPressure;
        });
      });
      if (BP) {
        observation.valueQuantity = BP.valueQuantity;
        formattedBPObservations.push(observation);
      }
    });

    return getQuantityValueAndUnit(formattedBPObservations[0]);
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
          return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }

  window.drawVisualization = function(p) {
    $('#holder').show();
    $('#loading').hide();
    $('#fname').html(p.fname);
    $('#lname').html(p.lname);
    $('#gender').html(p.gender);
    $('#birthdate').html(p.birthdate);
    $('#height').html(p.height);
    $('#systolicbp').html(p.systolicbp);
    $('#diastolicbp').html(p.diastolicbp);
    $('#ldl').html(p.ldl);
    $('#hdl').html(p.hdl);
  };

})(window);
