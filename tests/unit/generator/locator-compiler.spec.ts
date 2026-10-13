import {
  expect,
  test,
} from '@playwright/test';

import {
  compileLocatorExpression,
} from '../../../tools/testflow/generator/locators/locator-compiler';

test(
  'compiles recorder xpath without reinterpretation',
  () => {
    const target = {
      key: 'ANY_TARGET',
      semanticName: 'Anything',

      preferredLocator: {
        kind: 'xpath',
        value:
          "//label[normalize-space(.)='Anything']/following::input[1]",
        strategy:
          'recorder',
        robustness:
          'high',
      },

      playwright: {
        preferredStrategy:
          'role+name',
        preferred:
          'page.getByRole("textbox")',
        locatorFallback:
          'page.locator("fallback")',
        interactionTemplate:
          '',
      },
    } as any;

    expect(
      compileLocatorExpression(
        target,
      ),
    ).toBe(
      'this.page.locator("xpath=//label[normalize-space(.)=\'Anything\']/following::input[1]")',
    );
  },
);
