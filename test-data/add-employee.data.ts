export interface AddEmployeeCase {
  name: string;

  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
  };
}

export const addEmployeeCases:
  AddEmployeeCase[] = [
    {
      name:
        'creates first employee',
      employee: {
        firstName:
          'TestAdrian',
        lastName:
          'Automation',
        employeeId:
          'TF10001',
      },
    },
    {
      name:
        'creates second employee',
      employee: {
        firstName:
          'TestMaria',
        lastName:
          'Automation',
        employeeId:
          'TF10002',
      },
    },
    {
      name:
        'creates third employee',
      employee: {
        firstName:
          'TestCarlos',
        lastName:
          'Automation',
        employeeId:
          'TF10003',
      },
    },
  ];
