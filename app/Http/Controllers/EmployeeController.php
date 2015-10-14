<?php

/**
 * This file is part of the HRis Software package.
 *
 * HRis - Human Resource and Payroll System
 *
 * @link    http://github.com/HB-Co/HRis
 */

namespace HRis\Http\Controllers;

use HRis\Eloquent\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * @param Employee $employee
     *
     * @author Bertrand Kintanar
     */
    public function __construct(Employee $employee)
    {
        $this->employee = $employee;
    }

    /**
     * @param Request $request
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @author Bertrand Kintanar
     */
    public function getByEmployeeId(Request $request)
    {
        $employee = $this->employee->getEmployeeById($request->get('employee_id'), null);

        return $this->xhr($employee);
    }
}
