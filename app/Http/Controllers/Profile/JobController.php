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
use HRis\Eloquent\JobHistory;
use HRis\Http\Controllers\Controller;
use HRis\Http\Requests\Profile\JobRequest;

class JobController extends Controller
{
    private $employee;

    private $job_history;

    /**
     * @param Employee $employee
     * @param JobHistory $job_history
     *
     * @author Bertrand Kintanar
     */
    public function __construct(Employee $employee, JobHistory $job_history)
    {
        $this->employee = $employee;
        $this->job_history = $job_history;
    }

    /**
     * @param JobRequest $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @author Bertrand Kintanar
     */
    public function update(JobRequest $request)
    {
        $_employee = $request->get('employee');

        $employee_id = $_employee['id'];

        $employee = $this->employee->whereId($employee_id)->first();

        $job_history = [];

        try {

            $_job_history = array_slice($_employee['job_history'], 0, 9);

            unset($_job_history['id'], $_job_history['work_shift_id']);

            $_job_history['effective_date'] = $_job_history['effective_date'] != '' ? $_job_history['effective_date'] : null;
            $_job_history['comments'] = $_job_history['comments'] != '' ? $_job_history['comments'] : null;

            $job_history_fillables = $this->job_history->getFillable();
            $current_employee_job = $this->job_history->getCurrentEmployeeJob($job_history_fillables, $employee_id);

            // TODO: check if effective_date doesn't have time.
            $_job_history['effective_date'] += ' 00:00:00';

            if ($current_employee_job != $_job_history) {
                $job_history = $this->job_history->create(array_filter($_job_history));
            }

            $attributes = array_filter(array_slice($request->get('employee'), 29, 3));

            $employee->update($attributes);
        } catch (Exception $e) {
            return $this->xhr(UNABLE_UPDATE_MESSAGE);
        }

        return $this->xhr(['job_history' => $job_history, 'text' => SUCCESS_UPDATE_MESSAGE]);
    }

    /**
     * Delete the Profile - Job.
     *
     * @param JobRequest $request
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @author Bertrand Kintanar
     */
    public function destroy(JobRequest $request)
    {
        $job_history_id = $request->get('id');

        try {
            $this->job_history->whereId($job_history_id)->delete();
        } catch (Exception $e) {
            return $this->xhr(UNABLE_DELETE_MESSAGE);
        }
        return $this->xhr(SUCCESS_DELETE_MESSAGE);

    }
}
