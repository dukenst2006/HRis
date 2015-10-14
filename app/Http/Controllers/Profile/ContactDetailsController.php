<?php

/**
 * This file is part of the HRis Software package.
 *
 * HRis - Human Resource and Payroll System
 *
 * @link    http://github.com/HB-Co/HRis
 */

namespace HRis\Http\Controllers\Profile;

use HRis\Eloquent\Employee;
use HRis\Http\Controllers\Controller;

class ContactDetailsController extends Controller
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
}
