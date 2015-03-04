<?php namespace HRis\Console\Commands;

use Carbon\Carbon;
use HRis\Eloquent\TimeLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use League\Csv\Reader;

class ImportTimeLog extends Command {

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import timelog from a given CSV file.';

    /**
     * The console command name.
     *
     * @var string
     */
    protected $name = 'import:timelog';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $csv = Reader::createFromPath(storage_path() . '/attendance.csv');

        $csv->setOffset(1);
        $data = $csv->query();

        foreach ($data as $lineIndex => $row)
        {

            $times = array_slice($row, 4, count($row) - 1);

            foreach ($times as $time)
            {
                if (empty($time))
                {
                    continue;
                }

                $data = [
                    'face_id'        => $row[0],
                    'swipe_date'     => $row[3],
                    'swipe_time'     => $time,
                    'swipe_datetime' => Carbon::parse($row[3] . ' ' . $time)
                ];
                $timelog = TimeLog::create($data);

                $this->info($timelog);
                Log::info($timelog);
            }
        }
    }

}
