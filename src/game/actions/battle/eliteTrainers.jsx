const eliteTrainers = [
  {
    name: "Aelric",
    type: "Colourless",
    gender: "Male",
    levels: {
      1: {
        leadPool: ["PI04", "PI05", "PI06", "SP04", "SP05", "SP06", "FF01", "FF02", "FF03"],
        supportPool1: ["MC01", "MC02", "MC03", "PI01", "PI02", "PI03", "SP01", "SP02", "SP03", "RA01", "RA02", "RA03", "DD01", "DD02", "DD03", "ZB01", "ZB02", "ZB03", "JG01", "JG02", "JG03"],
        supportPool2: ["PI01", "PI02", "PI03", "SP01", "SP02", "SP03", "DD01", "DD02", "DD03", "ZB01", "ZB02", "ZB03"],
      },
      2: {
        leadPool: ["PI04", "PI05", "PI06", "SP04", "SP05", "SP06", "FF01", "FF02", "FF03", "FF04"],
        supportPool1: ["MC01", "MC02", "MC03", "GD01", "GD02", "GD03", "PI04", "PI05", "PI06", "SP04", "SP05", "SP06", "FF01", "FF02", "FF03", "FF04", "VN04", "VN05", "VN06", "ZB04", "ZB05", "ZB06", "DD04", "DD05", "DD06"],
        supportPool2: ["PI04", "PI05", "PI06", "SP04", "SP05", "SP06", "PI01", "PI02", "PI03", "SP01", "SP02", "SP03", "DD01", "DD02", "DD03", "ZB01", "ZB02", "ZB03"],
      },
      3: {
        leadPool: ["PI07", "PI08", "PI09", "FF05", "FF06", "CA07", "CA08", "CA09", "AD01", "AD02", "AD03", "AD04", "AD05", "AD06"],
        supportPool1: ["PI04", "PI05", "PI06", "SP04", "SP05", "SP06", "WE07", "WE08", "WE09", "MC04", "MC05", "MC06", "VN04", "VN05", "VN06", "ZB04", "ZB05", "ZB06", "DD04", "DD05", "DD06", "GD04", "GD05", "GD06", "JG04", "JG05", "JG06", "TA01", "TA02", "TA03", "TA04", "TA05", "TA06"],
        supportPool2: ["PI04", "PI05", "PI06", "SP04", "SP05", "SP06", "VN04", "VN05", "VN06", "ZB04", "ZB05", "ZB06", "DD04", "DD05", "DD06"],
      },
      4: {
        leadPool: ["DN07", "DN08", "DN09", "PI07", "PI08", "PI09", "AD01", "AD02", "AD03", "AD04", "AD05", "AD06"],
        supportPool1: ["PI07", "PI08", "PI09", "AD01", "AD02", "AD03", "AD04", "AD05", "AD06", "SP04", "SP05", "SP06", "CA07", "CA08", "CA09", "WE07", "WE08", "WE09", "MC04", "MC05", "MC06", "MC07", "MC08", "MC09", "VN04", "VN05", "VN06", "ZB04", "ZB05", "ZB06", "DD04", "DD05", "DD06", "GD04", "GD05", "GD06", "JG04", "JG05", "JG06", "TA01", "TA02", "TA03", "TA04", "TA05", "TA06"],
        supportPool2: ["PI04", "PI05", "PI06", "SP04", "SP05", "SP06", "VN04", "VN05", "VN06", "ZB04", "ZB05", "ZB06", "DD04", "DD05", "DD06"],
      },
    },
  },
  {
    name: "Bryneth",
    type: "Fire",
    gender: "Female",
    levels: {
      1: {
        leadPool: ["GF01", "GF02", "GF03"],
        supportPool1: ["PT01", "PT02", "PT03", "VP01", "VP02", "VP03", "VX01", "VX02", "VX03", "MG01", "MG02", "MG03", "TA01", "TA02", "MN01", "MN02", "MN03", "EE01", "EE02", "EE03"],
        supportPool2: ["PT01", "PT02", "PT03", "VP01", "VP02", "VP03", "EE01", "EE02", "EE03"],
      },
      2: {
        leadPool: ["GF03"],
        supportPool1: ["VX04", "VX05", "VX06", "MG01", "MG02", "MG03", "TA01", "TA02", "TA03", "TA04", "TA05", "TA06", "VP04", "VP05", "VP06", "PT04", "PT05", "PT06", "MN04"],
        supportPool2: ["MG01", "MG02", "MG03", "TA01", "TA02", "TA03", "TA04", "TA05", "TA06", "VP04", "VP05", "VP06", "PT04", "PT05", "PT06", "MN04", "EE01", "EE02", "EE03"],
      },
      3: {
        leadPool: ["GF04", "GF05", "GF06"],
        supportPool1: ["VX04", "VX05", "VX06", "MG01", "MG02", "MG03", "TA01", "TA02", "TA03", "TA04", "TA05", "TA06", "VP04", "VP05", "VP06", "PT04", "PT05", "PT06", "MN04", "MN05", "MN06", "FL01", "FL02", "FL03"],
        supportPool2: ["PT01", "PT02", "PT03", "VP01", "VP02", "VP03", "PT04", "PT05", "PT06", "GF01", "GF02", "GF03", "VP04", "VP05", "VP06"],
      },
      4: {
        leadPool: ["GF04", "GF05", "GF06"],
        supportPool1: ["VX04", "VX05", "VX06", "MG04", "MG05", "MG06", "TA01", "TA02", "TA03", "TA04", "TA05", "TA06", "VP04", "VP05", "VP06", "PT04", "PT05", "PT06", "MN04", "MN05", "MN06"],
        supportPool2: ["ML01", "ML02", "ML03", "FL01", "FL02", "FL03"],
      },
    },
  },
  {
    name: "Caelor",
    type: "Lightning",
    gender: "Male",
    levels: {
      1: {
        leadPool: ["VX04", "VX05", "VX06", "MM01", "MM02", "MM03", "MG04", "MG05", "MG06"],
        supportPool1: ["VX01", "VX02", "VX03", "MG01", "MG02", "MG03", "MM01", "MM02", "MM03", "RA01", "RA02", "RA03", "PR01", "PR02", "PR03", "OD01", "OD02", "OD03", "EE01", "EE02", "EE03"],
        supportPool2: ["VX01", "VX02", "VX03", "MG01", "MG02", "MG03"],
      },
      2: {
        leadPool: ["VX04", "VX05", "VX06", "MM01", "MM02", "MM03", "MM04", "MM05", "MM06", "MG04", "MG05", "MG06"],
        supportPool1: ["MM01", "MM02", "MM03", "MM04", "MM05", "MM06", "OD04", "OD05", "OD06", "PR04", "PR05", "PR06", "DN01", "DN02", "DN03", "EE03"],
        supportPool2: ["VX01", "VX02", "VX03", "MG01", "MG02", "MG03"],
      },
      3: {
        leadPool: ["JO01", "JO02", "JO03", "JY01", "JY02", "JY03", "JY04", "JY05", "JY06", "DN04", "DN05", "DN06"],
        supportPool1: ["VX04", "VX05", "VX06", "MG04", "MG05", "MG06", "MM01", "MM02", "MM03", "MM04", "MM05", "MM06", "OD04", "OD05", "OD06", "PR04", "PR05", "PR06", "DN01", "DN02", "DN03"],
        supportPool2: ["VX04", "VX05", "VX06", "MG04", "MG05", "MG06", "MM01", "MM02", "MM03", "MM04", "MM05", "MM06"],
      },
      4: {
        leadPool: ["DN07", "DN08", "DN09", "JO03"],
        supportPool1: ["JY01", "JY02", "JY03", "JY04", "JY05", "JY06", "JO01", "JO02", "JO03", "DN04", "DN05", "DN06"],
        supportPool2: ["VX04", "VX05", "VX06", "MG04", "MG05", "MG06", "MM01", "MM02", "MM03", "MM04", "MM05", "MM06", "OD07", "OD08", "OD09"],
      },
    },
  },
  {
    name: "Caerwyn",
    type: "Psychic",
    gender: "Male",
    levels: {
      1: {
        leadPool: ["DR04", "DR05", "DR06", "MM01", "MM02", "MM03", "MM04", "MM05", "MM06", "JY01", "JY02"],
        supportPool1: ["AB01", "AB02", "AB03", "DR01", "DR02", "DR03", "PL01", "PL02", "PL03", "PS01", "PS02", "PS03", "ST01", "ST02", "ST03"],
        supportPool2: ["AB01", "AB02", "AB03", "DR01", "DR02", "DR03"],
      },
      2: {
        leadPool: ["DR04", "DR05", "DR06", "MM01", "MM02", "MM03", "MM04", "MM05", "MM06", "JY01", "JY02", "JY03", "JY04", "AB04"],
        supportPool1: ["DR04", "DR05", "DR06", "MM01", "MM02", "MM03", "MM04", "MM05", "MM06", "JY01", "JY02"],
        supportPool2: ["AB01", "AB02", "AB03", "DR01", "DR02", "DR03", "PL01", "PL02", "PL03", "PS01", "PS02", "PS03", "ST01", "ST02", "ST03"],
      },
      3: {
        leadPool: ["AB04", "AB05", "AB06"],
        supportPool1: ["DR04", "DR05", "DR06", "MM01", "MM02", "MM03", "MM04", "MM05", "MM06", "JY01", "JY02", "JY03", "JY04"],
        supportPool2: ["DR04", "DR05", "DR06", "PL04", "PL05", "PL06", "PS04", "PS05", "PS06", "ST04"],
      },
      4: {
        leadPool: ["AB07", "AB08", "AB09"],
        supportPool1: ["JY01", "JY02", "JY03", "JY04", "JY05", "JY06", "DR04", "DR05", "DR06", "MM01", "MM02", "MM03", "MM04", "MM05", "MM06", "ST04", "ST05", "ST06"],
        supportPool2: ["DR04", "DR05", "DR06", "PL04", "PL05", "PL06", "PL07", "PL08", "PL09", "PS04", "PS05", "PS06", "ST04", "ST05", "ST06"],
      },
    },
  },
  {
    name: "Draelin",
    type: "Fire",
    gender: "Male",
    levels: {
      1: {
        leadPool: ["CH01", "CH02", "CH03"],
        supportPool1: ["GD01", "GD02", "GD03", "CW01", "CW02", "CW03", "PT01", "PT02", "PT03", "VP01", "VP02", "VP03", "ZB01", "ZB02", "ZB03", "GM01", "GM02", "GM03"],
        supportPool2: ["PT01", "PT02", "PT03", "VP01", "VP02", "VP03"],
      },
      2: {
        leadPool: ["CH03"],
        supportPool1: ["GD04", "GD05", "GD06", "GD01", "GD02", "GD03", "CW04", "CW05", "CW06", "CW01", "CW02", "CW03", "ZB04", "ZB05", "ZB06", "ON01", "ON02", "ON03"],
        supportPool2: ["PT01", "PT02", "PT03", "VP01", "VP02", "VP03", "MA01", "MA02"],
      },
      3: {
        leadPool: ["CH04", "CH05", "CH06"],
        supportPool1: ["GD04", "GD05", "GD06", "CW04", "CW05", "CW06", "ZB04", "ZB05", "ZB06", "ON01", "ON02", "ON03", "GM04", "GM05", "GM06"],
        supportPool2: ["PT04", "PT05", "PT06", "VP04", "VP05", "VP06", "MA01", "MA02", "MA03"],
      },
      4: {
        leadPool: ["CH07", "CH08", "CH09"],
        supportPool1: ["MA01", "MA02", "MA03", "GD07", "GD08", "GD09", "CW04", "CW05", "CW06", "ZB04", "ZB05", "ZB06", "ON01", "ON02", "ON03", "GM04", "GM05", "GM06"],
        supportPool2: ["PT04", "PT05", "PT06", "VP04", "VP05", "VP06", "MA01", "MA02", "MA03", "GM04", "GM05", "GM06"],
      },
    },
  },
  {
    name: "Eirwen",
    type: "Psychic",
    gender: "Female",
    levels: {
      1: {
        leadPool: ["GA01", "GA02", "GA03"],
        supportPool1: ["DR01", "DR02", "DR03", "KO01", "KO02", "KO03", "EK01", "EK02", "EK03", "EG01", "EG02", "EG03", "PY01", "PY02"],
        supportPool2: ["DR01", "DR02", "DR03", "KO01", "KO02", "KO03", "EK01", "EK02", "EK03"],
      },
      2: {
        leadPool: ["GA04", "GA05", "GA06"],
        supportPool1: ["DR01", "DR02", "DR03", "KO01", "KO02", "KO03", "KO04", "KO05", "KO06", "EK01", "EK02", "EK03", "EK04", "EK05", "EK06", "EG01", "EG02", "EG03", "PY01", "PY02", "PY03", "PY04", "PY05", "PY06"],
        supportPool2: ["DR01", "DR02", "DR03", "KO01", "KO02", "KO03", "EK01", "EK02", "EK03"],
      },
      3: {
        leadPool: ["GA04", "GA05", "GA06"],
        supportPool1: ["DR04", "DR05", "DR06", "KO04", "KO05", "KO06", "EK04", "EK05", "EK06", "PY01", "PY02", "PY03", "PY04", "PY05", "PY06"],
        supportPool2: ["DR04", "DR05", "DR06", "KO04", "KO05", "KO06", "EK04", "EK05", "EK06", "PY01", "PY02", "PY03", "PY04", "PY05", "PY06"],
      },
      4: {
        leadPool: ["GA07", "GA08", "GA09", "MY01", "MY02", "MY03"],
        supportPool1: ["GA04", "GA05", "GA06", "EG04", "EG05", "EG06", "PY01", "PY02", "PY03", "PY04", "PY05", "PY06"],
        supportPool2: ["GA04", "GA05", "GA06", "DR04", "DR05", "DR06", "KO04", "KO05", "KO06", "EK04", "EK05", "EK06"],
      },
    },
  },
  {
    name: "Faelis",
    type: "Grass",
    gender: "Female",
    levels: {
      1: {
        leadPool: ["BU01", "BU02", "BU03", "NI04", "NI05", "NI06", "NM04", "NM05", "NM06"],
        supportPool1: ["GL01", "GL02", "GL03", "PL01", "PL02", "PL03", "PS01", "PS02", "PS03", "HS01", "HS02", "HS03"],
        supportPool2: ["OD01", "OD02", "OD03", "BT01", "BT02", "BT03", "TG01", "TG02"],
      },
      2: {
        leadPool: ["BU01", "BU02", "BU03", "NI04", "NI05", "NI06", "NM04", "NM05", "NM06"],
        supportPool1: ["GL04", "GL05", "GL06", "PL04", "PL05", "PL06", "PS04", "PS05", "PS06", "HS04", "HS05", "HS06", "OM01", "OM02", "OM03"],
        supportPool2: ["OD01", "OD02", "OD03", "BT01", "BT02", "BT03", "TG01", "TG02"],
      },
      3: {
        leadPool: ["BU04", "BU05", "BU06", "NI07", "NI08", "NI09", "NM07", "NM08", "NM09"],
        supportPool1: ["GL04", "GL05", "GL06", "PL04", "PL05", "PL06", "PS04", "PS05", "PS06", "HS04", "HS05", "HS06", "OM01", "OM02", "OM03"],
        supportPool2: ["OD04", "OD05", "OD06", "BT04", "BT05", "BT06", "TG01", "TG02", "TG03", "TG04", "TG05", "TG06"],
      },
      4: {
        leadPool: ["BU07", "BU08", "BU09"],
        supportPool1: ["GL04", "GL05", "GL06", "PL04", "PL05", "PL06", "PS04", "PS05", "PS06", "HS04", "HS05", "HS06", "OM01", "OM02", "OM03", "OM04", "OM05", "OM06"],
        supportPool2: ["NI07", "NI08", "NI09", "NM07", "NM08", "NM09", "OD07", "OD08", "OD09", "BT07", "BT08", "BT09"],
      },
    },
  },
  {
    name: "Garron",
    type: "Fighting",
    gender: "Male",
    levels: {
      1: {
        leadPool: ["MK04", "MK05", "MK06", "CW04", "CW05", "CW06"],
        supportPool1: ["DR01", "DR02", "DR03", "CL01", "MC01", "MC02", "MC03"],
        supportPool2: ["MC01", "MC02", "MC03", "SS01", "SS02", "SS03", "CW01", "CW02", "CW03", "MK01", "MK02", "MK03"],
      },
      2: {
        leadPool: ["MK04", "MK05", "MK06", "CW04", "CW05", "CW06", "MC04"],
        supportPool1: ["DR01", "DR02", "DR03", "DR04", "DR05", "DR06", "CL01", "CL02", "CL03", "EB01", "MA01", "KN01"],
        supportPool2: ["MC01", "MC02", "MC03", "SS01", "SS02", "SS03", "CW01", "CW02", "CW03", "MK01", "MK02", "MK03"],
      },
      3: {
        leadPool: ["HL01", "HL02", "HL03", "HL04", "HL05", "HL06", "HC01", "HC02", "HC03", "HC04", "HC05", "HC06", "MC04", "MC05", "MC06"],
        supportPool1: ["MK04", "MK05", "MK06", "CW04", "CW05", "CW06", "DR01", "DR02", "DR03", "DR04", "DR05", "DR06", "CL01", "CL02", "CL03", "EB01", "EB02", "EB03", "MA01", "MA02", "MA03", "KN01", "KN02", "KN03"],
        supportPool2: ["MK04", "MK05", "MK06", "CW04", "CW05", "CW06", "MC01", "MC02", "MC03", "SS01", "SS02", "SS03", "CW01", "CW02", "CW03", "MK01", "MK02", "MK03", "MC04"],
      },
      4: {
        leadPool: ["MC07", "MC08", "MC09"],
        supportPool1: ["HC01", "HC02", "HC03", "HC04", "HC05", "HC06", "HL01", "HL02", "HL03", "HL04", "HL05", "HL06"],
        supportPool2: ["MK04", "MK05", "MK06", "CW04", "CW05", "CW06", "DR01", "DR02", "DR03", "DR04", "DR05", "DR06", "CL01", "CL02", "CL03", "EB01", "EB02", "EB03", "MA01", "MA02", "MA03", "KN01", "KN02", "KN03"],
      },
    },
  },
  {
    name: "Kaelis",
    type: "Water",
    gender: "Female",
    levels: {
      1: {
        leadPool: ["PL04", "PL05", "PL06", "ST01", "ST02", "ST03", "SQ01", "SQ02", "SQ03"],
        supportPool1: ["MKP01", "MKP02", "MKP03", "HS01", "HS02", "HS03", "TN01", "TN02", "TN03", "SQ01", "PL01", "PL02", "PL03", "MN01", "MN02", "MN03", "RA01", "RA02", "RA03"],
        supportPool2: ["MKP01", "MKP02", "MKP03", "HS01", "HS02", "HS03", "TN01", "TN02", "TN03", "SQ01", "PL01", "PL02", "PL03"],
      },
      2: {
        leadPool: ["PL04", "PL05", "PL06", "ST01", "ST02", "ST03", "SQ01", "SQ02", "SQ03"],
        supportPool1: ["MKP01", "MKP02", "MKP03", "HS01", "HS02", "HS03", "TN01", "TN02", "TN03", "SQ01", "SQ02", "SQ03", "PL01", "PL02", "PL03", "MN01", "MN02", "MN03", "RA01", "RA02", "RA03"],
        supportPool2: ["HS04", "HS05", "HS06", "TN04", "TN05", "TN06", "SQ01", "SQ02", "SQ03", "HS01", "HS02", "HS03", "TN01", "TN02", "TN03", "PL01", "PL02", "PL03"],
      },
      3: {
        leadPool: ["PL07", "PL08", "PL09", "ST04", "ST05", "ST06", "LP01", "LP02", "LP03", "LP04", "LP05", "LP06"],
        supportPool1: ["SQ01", "SQ02", "SQ03", "SQ04", "SQ05", "SQ06", "HS04", "HS05", "HS06", "TN04", "TN05", "TN06", "ST01", "ST02", "ST03", "HS01", "HS02", "HS03", "TN01", "TN02", "TN03", "PL01", "PL02", "PL03", "MN01", "MN02", "MN03", "RA01", "RA02", "RA03", "MN04", "MN05", "MN06", "RA04", "RA05", "RA06"],
        supportPool2: ["HS04", "HS05", "HS06", "TN04", "TN05", "TN06", "SQ01", "SQ02", "SQ03", "ST01", "ST02", "ST03"],
      },
      4: {
        leadPool: ["MKP04", "MKP05", "MKP06"],
        supportPool1: ["PL07", "PL08", "PL09", "ST04", "ST05", "ST06", "LP01", "LP02", "LP03", "LP04", "LP05", "LP06"],
        supportPool2: ["SQ01", "SQ02", "SQ03", "SQ04", "SQ05", "SQ06", "HS04", "HS05", "HS06", "TN04", "TN05", "TN06", "HS01", "HS02", "HS03", "ST01", "ST02", "ST03", "TN01", "TN02", "TN03", "PL04", "PL05", "PL06", "MN01", "MN02", "MN03", "RA01", "RA02", "RA03", "MN04", "MN05", "MN06", "RA04", "RA05", "RA06"],
      },
    },
  },
  {
    name: "Maelor",
    type: "Lightning",
    gender: "Male",
    levels: {
      1: {
        leadPool: ["VX04", "VX05", "VX06", "PK01", "PK02", "PK03", "MG04", "MG05", "MG06"],
        supportPool1: ["VX01", "VX02", "VX03", "MG01", "MG02", "MG03", "PK01", "EE01", "EE02", "EE03"],
        supportPool2: ["VX01", "VX02", "VX03", "MG01", "MG02", "MG03", "EE01", "EE02", "EE03"],
      },
      2: {
        leadPool: ["VX04", "VX05", "VX06", "PK01", "PK02", "PK03", "MG04", "MG05", "MG06", "EB01"],
        supportPool1: ["VX04", "VX05", "VX06", "PK01", "PK02", "PK03", "MG04", "MG05", "MG06"],
        supportPool2: ["VX01", "VX02", "VX03", "MG01", "MG02", "MG03", "EE01", "EE02", "EE03"],
      },
      3: {
        leadPool: ["PK04", "PK05", "PK06", "JO01", "JO02", "JO03"],
        supportPool1: ["VX04", "VX05", "VX06", "PK01", "PK02", "PK03", "MG04", "MG05", "MG06", "EB01", "EB02", "EB03"],
        supportPool2: ["VX04", "VX05", "VX06", "PK01", "PK02", "PK03", "MG04", "MG05", "MG06", "EB01", "EB02", "EB03"],
      },
      4: {
        leadPool: ["ZP01", "ZP02", "ZP03"],
        supportPool1: ["PK04", "PK05", "PK06", "JO01", "JO02", "JO03", "EB01", "EB02", "EB03", "EB04", "EB05", "EB06"],
        supportPool2: ["VX04", "VX05", "VX06", "PK01", "PK02", "PK03", "MG04", "MG05", "MG06"],
      },
    },
  },
  {
    name: "Nereth",
    type: "Colourless",
    gender: "Female",
    levels: {
      1: {
        leadPool: ["CL01", "CL02", "CL03", "JG04", "JG05", "JG06", "DN01", "DN02", "DN03"],
        supportPool1: ["JG01", "JG02", "JG03", "PI01", "PI02", "PI03", "VP01", "VP02", "VP03", "EE01", "DG01", "DG02", "DG03", "OD01", "OD02", "OD03"],
        supportPool2: ["JG01", "JG02", "JG03", "PI01", "PI02", "PI03", "EE01"],
      },
      2: {
        leadPool: ["CL01", "CL02", "CL03", "JG04", "JG05", "JG06", "DN01", "DN02", "DN03"],
        supportPool1: ["PK01", "PK02", "PK03", "JG01", "JG02", "JG03", "PI01", "PI02", "PI03", "VP01", "VP02", "VP03", "EE01", "EE02", "EE03", "DG01", "DG02", "DG03", "OD01", "OD02", "OD03"],
        supportPool2: ["JG01", "JG02", "JG03", "PI01", "PI02", "PI03", "EE01"],
      },
      3: {
        leadPool: ["CL04", "CL05", "CL06", "CY01", "CY02", "CY03", "CY04", "CY05", "CY06", "DN04", "DN05", "DN06"],
        supportPool1: ["CL01", "CL02", "CL03", "JG04", "JG05", "JG06", "DN01", "DN02", "DN03", "EE01", "EE02", "EE03", "PK01", "PK02", "PK03"],
        supportPool2: ["PI01", "PI02", "PI03", "VP01", "VP02", "VP03", "DG01", "DG02", "DG03", "OD01", "OD02", "OD03"],
      },
      4: {
        leadPool: ["DN07", "DN08", "DN09", "CY06", "ME01", "ME02", "ME03"],
        supportPool1: ["CL04", "CL05", "CL06", "CY01", "CY02", "CY03", "CY04", "CY05", "CY06", "DN04", "DN05", "DN06"],
        supportPool2: ["CL01", "CL02", "CL03", "JG04", "JG05", "JG06", "DN01", "DN02", "DN03", "EE01", "EE02", "EE03", "PI01", "PI02", "PI03", "VP01", "VP02", "VP03", "DG01", "DG02", "DG03", "OD01", "OD02", "OD03", "PK01", "PK02", "PK03"],
      },
    },
  },
  {
    name: "Orric",
    type: "Water",
    gender: "Male",
    levels: {
      1: {
        leadPool: ["SD04", "SD05", "SD06", "KB01", "KB02", "KB03"],
        supportPool1: ["SD01", "SD02", "SD03", "GL01", "GL02", "GL03", "SQ01", "PS01", "PS02", "PS03", "MC01", "MC02", "MC03", "MK01", "MK02", "MK03"],
        supportPool2: ["SD01", "SD02", "SD03", "GL01", "GL02", "GL03", "SQ01", "PS01", "PS02", "PS03"],
      },
      2: {
        leadPool: ["SD04", "SD05", "SD06", "KB01", "KB02", "KB03"],
        supportPool1: ["SD04", "SD05", "SD06", "KB01", "KB02", "KB03", "PS04", "PS05", "PS06", "SQ01", "SQ02", "SQ03", "GL04", "GL05", "GL06", "MC01", "MC02", "MC03", "MK04", "MK05", "MK06"],
        supportPool2: ["SD01", "SD02", "SD03", "GL01", "GL02", "GL03", "SQ01", "SQ02", "SQ03", "PS01", "PS02", "PS03"],
      },
      3: {
        leadPool: ["SQ04", "SQ05", "SQ06", "KB04", "KB05", "KB06"],
        supportPool1: ["SD04", "SD05", "SD06", "KB01", "KB02", "KB03", "PS04", "PS05", "PS06", "SQ01", "SQ02", "SQ03", "GL04", "GL05", "GL06", "MC01", "MC02", "MC03", "MK04", "MK05", "MK06"],
        supportPool2: ["SD04", "SD05", "SD06", "KB01", "KB02", "KB03", "PS04", "PS05", "PS06", "GL04", "GL05", "GL06"],
      },
      4: {
        leadPool: ["SQ07", "SQ08", "SQ09", "AR01", "AR02", "AR03"],
        supportPool1: ["KB04", "KB05", "KB06", "SQ04", "SQ05", "SQ06"],
        supportPool2: ["SD04", "SD05", "SD06", "KB01", "KB02", "KB03", "PS04", "PS05", "PS06", "GL04", "GL05", "GL06", "MK04", "MK05", "MK06"],
      },
    },
  },
  {
    name: "Rhyelle",
    type: "Fighting",
    gender: "Female",
    levels: {
      1: {
        leadPool: ["ON01", "ON02", "ON03", "ON04", "ON05", "ON06", "GD04", "GD05", "GD06", "RH01", "RH02", "RH03", "DG04", "DG05", "DG06"],
        supportPool1: ["GD01", "GD02", "GD03", "DG01", "DG02", "DG03", "NI01", "NI02", "NI03", "NM01", "NM02", "NM03", "TA01", "PI01", "PI02", "PI03", "BT01", "BT02", "BT03"],
        supportPool2: ["GD01", "GD02", "GD03", "DG01", "DG02", "DG03"],
      },
      2: {
        leadPool: ["KN01", "ON01", "ON02", "ON03", "ON04", "ON05", "ON06", "GD04", "GD05", "GD06", "RH01", "RH02", "RH03", "DG04", "DG05", "DG06"],
        supportPool1: ["KN01", "ON01", "ON02", "ON03", "ON04", "ON05", "ON06", "GD04", "GD05", "GD06", "RH01", "RH02", "RH03", "DG04", "DG05", "DG06"],
        supportPool2: ["GD01", "GD02", "GD03", "DG01", "DG02", "DG03", "NI01", "NI02", "NI03", "NM01", "NM02", "NM03", "TA01", "PI01", "PI02", "PI03", "BT01", "BT02", "BT03"],
      },
      3: {
        leadPool: ["KN01", "KN02", "KN03", "KN04", "KN05", "KN06", "GD07", "GD08", "GD09", "RH04", "RH05", "RH06"],
        supportPool1: ["ON01", "ON02", "ON03", "ON04", "ON05", "ON06", "DG04", "DG05", "DG06", "NI04", "NI05", "NI06", "NM04", "NM05", "NM06", "TA01", "TA02", "TA03", "TA04", "TA05", "TA06", "PI04", "PI05", "PI06", "BT04", "BT05", "BT06"],
        supportPool2: ["ON01", "ON02", "ON03", "ON04", "ON05", "ON06", "GD04", "GD05", "GD06", "RH01", "RH02", "RH03", "DG04", "DG05", "DG06"],
      },
      4: {
        leadPool: ["KN01", "KN02", "KN03", "KN04", "KN05", "KN06", "GD07", "GD08", "GD09", "RH04", "RH05", "RH06"],
        supportPool1: ["KN01", "KN02", "KN03", "KN04", "KN05", "KN06", "GD07", "GD08", "GD09", "RH04", "RH05", "RH06"],
        supportPool2: ["KN01", "KN02", "KN03", "KN04", "KN05", "KN06", "GD07", "GD08", "GD09", "RH04", "RH05", "RH06", "NI07", "NI08", "NI09", "NM07", "NM08", "NM09", "PI07", "PI08", "PI09", "BT07", "BT08", "BT09"],
      },
    },
  },
  {
    name: "Ysryn",
    type: "Grass",
    gender: "Female",
    levels: {
      1: {
        leadPool: ["PR04", "PR05", "PR06", "VN04", "VN05", "VN06"],
        supportPool1: ["WE01", "WE02", "WE03", "CA01", "CA02", "CA03", "CA04", "CA05", "CA06", "WE04", "WE05", "WE06", "PR01", "PR02", "PR03", "VN01", "VN02", "VN03"],
        supportPool2: ["WE01", "WE02", "WE03", "CA01", "CA02", "CA03", "CA04", "CA05", "CA06", "WE04", "WE05", "WE06"],
      },
      2: {
        leadPool: ["PR04", "PR05", "PR06", "VN04", "VN05", "VN06"],
        supportPool1: ["PR04", "PR05", "PR06", "VN04", "VN05", "VN06", "PR01", "PR02", "PR03", "VN01", "VN02", "VN03"],
        supportPool2: ["WE01", "WE02", "WE03", "CA01", "CA02", "CA03", "CA04", "CA05", "CA06", "WE04", "WE05", "WE06"],
      },
      3: {
        leadPool: ["CA07", "CA08", "CA09", "WE07", "WE08", "WE09"],
        supportPool1: ["SC01", "SC02", "SC03", "PN01", "PN02", "PN03", "PR04", "PR05", "PR06", "VN04", "VN05", "VN06"],
        supportPool2: ["WE01", "WE02", "WE03", "CA01", "CA02", "CA03", "CA04", "CA05", "CA06", "WE04", "WE05", "WE06"],
      },
      4: {
        leadPool: ["CA07", "CA08", "CA09", "WE07", "WE08", "WE09", "SC06", "PN06"],
        supportPool1: ["CA07", "CA08", "CA09", "WE07", "WE08", "WE09", "SC01", "SC02", "SC03", "SC04", "SC05", "SC06", "PN01", "PN02", "PN03", "PN04", "PN05", "PN06"],
        supportPool2: ["SC01", "SC02", "SC03", "SC04", "SC05", "SC06", "PN01", "PN02", "PN03", "PN04", "PN05", "PN06", "PR04", "PR05", "PR06", "VN04", "VN05", "VN06"],
      },
    },
  },
  {
    name: "Geth",
    type: "All",
    gender: "Male",
    levels: {
      1: {
        leadPool: ["BU01", "BU02", "BU03", "CH01", "CH02", "CH03", "SQ01", "SQ02", "SQ03"],
        supportPool1: ["AB01", "AB02", "AB03", "VX01", "VX02", "VX03", "GD01", "GD02", "GD03", "MN01", "MN02", "MN03", "EK01", "EK02", "EK03", "PS01", "PS02", "PS03"],
        supportPool2: ["DR01", "DR02", "DR03", "SS01", "SS02", "SS03", "JG01", "JG02", "JG03", "PT01", "PT02", "PT03"],
      },
      2: {
        leadPool: ["BU01", "BU02", "BU03", "CH01", "CH02", "CH03", "SQ01", "SQ02", "SQ03"],
        supportPool1: ["BU01", "BU02", "BU03", "CH01", "CH02", "CH03", "SQ01", "SQ02", "SQ03", "DR04", "DR05", "DR06", "JG04", "JG05", "JG06", "MG04", "MG05", "MG06", "GD04", "GD05", "GD06"],
        supportPool2: ["DR01", "DR02", "DR03", "SS01", "SS02", "SS03", "JG01", "JG02", "JG03", "PT01", "PT02", "PT03", "EK01", "EK02", "EK03", "PS01", "PS02", "PS03", "AB01", "AB02", "AB03", "VX01", "VX02", "VX03", "GD01", "GD02", "GD03", "MN01", "MN02", "MN03"],
      },
      3: {
        leadPool: ["BU04", "BU05", "BU06", "CH04", "CH05", "CH06", "SQ04", "SQ05", "SQ06"],
        supportPool1: ["BU01", "BU02", "BU03", "CH01", "CH02", "CH03", "SQ01", "SQ02", "SQ03", "DR04", "DR05", "DR06", "JG04", "JG05", "JG06", "MG04", "MG05", "MG06", "GD04", "GD05", "GD06"],
        supportPool2: ["KO04", "KO05", "KO06", "GF01", "GF02", "GF03", "PS04", "PS05", "PS06", "GA04", "GA05", "GA06", "FF01", "FF02", "FF03", "FF04", "FF05", "FF06", "PK01", "PK02", "PK03", "ON01", "ON02", "ON03", "ON04", "ON05", "ON06"],
      },
      4: {
        leadPool: ["BU07", "BU08", "BU09", "CH07", "CH08", "CH09", "SQ07", "SQ08", "SQ09"],
        supportPool1: ["BU04", "BU05", "BU06", "CH04", "CH05", "CH06", "SQ04", "SQ05", "SQ06", "AB04", "AB05", "AB06", "SN01", "SN02", "SN03", "SN04", "SN05", "SN06", "PK04", "PK05", "PK06", "HL01", "HL02", "HL03", "HL04", "HL05", "HL06", "HC01", "HC02", "HC03", "HC04", "HC05", "HC06", "MN04", "MN05", "MN06"],
        supportPool2: ["KO04", "KO05", "KO06", "GF01", "GF02", "GF03", "PS04", "PS05", "PS06", "GA04", "GA05", "GA06", "FF01", "FF02", "FF03", "FF04", "FF05", "FF06", "PK01", "PK02", "PK03", "ON01", "ON02", "ON03", "ON04", "ON05", "ON06"],
      },
    },
  },
];

export default eliteTrainers;
