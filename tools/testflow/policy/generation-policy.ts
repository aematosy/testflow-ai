export interface GenerationPolicy {
  version: '1.0';

  navigation: {
    useBaseURL: true;
    absoluteUrlsInGeneratedCodeForbidden: true;
  };

  data: {
    recordedValuesInSpecsForbidden: true;
    sensitiveValuesInSourceForbidden: true;
    runtimeCredentialsRequired: true;
  };

  playwright: {
    hardWaitsForbidden: true;
    rawSelectorsOutsideLocatorsForbidden: true;
  };
}

export const GENERATION_POLICY:
  GenerationPolicy = {
    version: '1.0',

    navigation: {
      useBaseURL: true,
      absoluteUrlsInGeneratedCodeForbidden:
        true,
    },

    data: {
      recordedValuesInSpecsForbidden:
        true,
      sensitiveValuesInSourceForbidden:
        true,
      runtimeCredentialsRequired:
        true,
    },

    playwright: {
      hardWaitsForbidden:
        true,
      rawSelectorsOutsideLocatorsForbidden:
        true,
    },
  };
