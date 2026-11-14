// The reference library for DISC LAB. Only these papers are cited directly.
// Studies they cite are named as "via <paper>" and are not claimed as read.

export interface Reference {
  key: string;
  short: string;
  full: string;
  doi?: string;
}

export const REFERENCES: Record<string, Reference> = {
  volz: {
    key: 'volz',
    short: 'Volz et al. 2022',
    full: 'Volz M, Elmasry S, Jackson AR, Travascio F. Computational modeling intervertebral disc pathophysiology: a review. Front Physiol. 2022;12:750668.',
    doi: '10.3389/fphys.2021.750668',
  },
  ellingson: {
    key: 'ellingson',
    short: 'Ellingson & Nuckley 2012',
    full: 'Ellingson AM, Nuckley DJ. Intervertebral disc viscoelastic parameters and residual mechanics spatially quantified using a hybrid confined/in situ indentation method. J Biomech. 2012;45:491–496.',
    doi: '10.1016/j.jbiomech.2011.11.050',
  },
  oconnell: {
    key: 'oconnell',
    short: "O'Connell et al. 2011",
    full: "O'Connell GD, Jacobs NT, Sen S, Vresilovic EJ, Elliott DM. Axial creep loading and unloaded recovery of the human intervertebral disc and the effect of degeneration. J Mech Behav Biomed Mater. 2011;4(7):933–942.",
    doi: '10.1016/j.jmbbm.2011.02.002',
  },
  newell17: {
    key: 'newell17',
    short: 'Newell et al. 2017',
    full: 'Newell N, Little JP, Christou A, Adams MA, Adam CJ, Masouros SD. Biomechanics of the human intervertebral disc: a review of testing techniques and results. J Mech Behav Biomed Mater. 2017;69:420–434.',
    doi: '10.1016/j.jmbbm.2017.01.037',
  },
  nerurkar: {
    key: 'nerurkar',
    short: 'Nerurkar et al. 2010',
    full: 'Nerurkar NL, Elliott DM, Mauck RL. Mechanical design criteria for intervertebral disc tissue engineering. J Biomech. 2010;43(6):1017–1030.',
    doi: '10.1016/j.jbiomech.2009.12.001',
  },
  newell20: {
    key: 'newell20',
    short: 'Newell et al. 2020',
    full: 'Newell N, Rivera Tapia D, Rahman T, Lim S, O’Connell GD, Holsgrove TP. Influence of testing environment and loading rate on intervertebral disc compressive mechanics: an assessment of repeatability at three different laboratories. JOR Spine. 2020;3:e1110.',
    doi: '10.1002/jsp2.1110',
  },
  joshi: {
    key: 'joshi',
    short: 'Joshi et al. 2006',
    full: 'Joshi A, Fussell G, Thomas J, Hsuan A, Lowman A, Karduna A, Vresilovic E, Marcolongo M. Functional compressive mechanics of a PVA/PVP nucleus pulposus replacement. Biomaterials. 2006;27:176–184.',
    doi: '10.1016/j.biomaterials.2005.06.003',
  },
  delaine: {
    key: 'delaine',
    short: 'Delaine-Smith et al. 2016',
    full: 'Delaine-Smith RM, Burney S, Balkwill FR, Knight MM. Experimental validation of a flat punch indentation methodology calibrated against unconfined compression tests for determination of soft tissue biomechanics. J Mech Behav Biomed Mater. 2016;60:401–415.',
    doi: '10.1016/j.jmbbm.2016.02.019',
  },
};
