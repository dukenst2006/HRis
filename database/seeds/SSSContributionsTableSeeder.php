<?php

/**
 * This file is part of the HRis Software package.
 *
 * HRis - Human Resource and Payroll System
 *
 * @link    http://github.com/HB-Co/HRis
 *
 */

use Illuminate\Database\Seeder;

class SSSContributionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     * @author Bertrand Kintanar
     */
    public function run()
    {
        DB::table('sss_contributions')->truncate();

        DB::table('sss_contributions')->insert(
            [
                [
                    'range_compensation_from'  => 1000.00,
                    'range_compensation_to'    => 1249.99,
                    'monthly_salry_credit'     => 1000.00,
                    'sss_er'                   => 70.70,
                    'sss_ee'                   => 33.30,
                    'sss_total'                => 104.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 80.70,
                    'total_contribution_ee'    => 33.30,
                    'total_contribution_total' => 114.00
                ],
                [
                    'range_compensation_from'  => 1250.00,
                    'range_compensation_to'    => 1749.99,
                    'monthly_salry_credit'     => 1500.00,
                    'sss_er'                   => 106.00,
                    'sss_ee'                   => 50.00,
                    'sss_total'                => 156.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 116.00,
                    'total_contribution_ee'    => 50.00,
                    'total_contribution_total' => 166.00
                ],
                [
                    'range_compensation_from'  => 1750.00,
                    'range_compensation_to'    => 2249.99,
                    'monthly_salry_credit'     => 2000.00,
                    'sss_er'                   => 141.30,
                    'sss_ee'                   => 66.70,
                    'sss_total'                => 208.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 151.30,
                    'total_contribution_ee'    => 66.70,
                    'total_contribution_total' => 218.00
                ],
                [
                    'range_compensation_from'  => 2250.00,
                    'range_compensation_to'    => 2749.99,
                    'monthly_salry_credit'     => 2500.00,
                    'sss_er'                   => 176.70,
                    'sss_ee'                   => 83.30,
                    'sss_total'                => 260.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 186.70,
                    'total_contribution_ee'    => 83.30,
                    'total_contribution_total' => 270.00
                ],
                [
                    'range_compensation_from'  => 2750.00,
                    'range_compensation_to'    => 3249.99,
                    'monthly_salry_credit'     => 3000.00,
                    'sss_er'                   => 212.00,
                    'sss_ee'                   => 100.00,
                    'sss_total'                => 312.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 222.00,
                    'total_contribution_ee'    => 100.00,
                    'total_contribution_total' => 322.00
                ],
                [
                    'range_compensation_from'  => 3250.00,
                    'range_compensation_to'    => 3749.99,
                    'monthly_salry_credit'     => 3500.00,
                    'sss_er'                   => 247.30,
                    'sss_ee'                   => 116.70,
                    'sss_total'                => 364.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 257.30,
                    'total_contribution_ee'    => 116.70,
                    'total_contribution_total' => 374.00
                ],
                [
                    'range_compensation_from'  => 3750.00,
                    'range_compensation_to'    => 4249.99,
                    'monthly_salry_credit'     => 4000.00,
                    'sss_er'                   => 282.70,
                    'sss_ee'                   => 133.30,
                    'sss_total'                => 416.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 292.70,
                    'total_contribution_ee'    => 133.30,
                    'total_contribution_total' => 426.00
                ],
                [
                    'range_compensation_from'  => 4250.00,
                    'range_compensation_to'    => 4749.99,
                    'monthly_salry_credit'     => 4500.00,
                    'sss_er'                   => 318.00,
                    'sss_ee'                   => 150.00,
                    'sss_total'                => 468.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 328.00,
                    'total_contribution_ee'    => 150.00,
                    'total_contribution_total' => 478.00
                ],
                [
                    'range_compensation_from'  => 4750.00,
                    'range_compensation_to'    => 5249.99,
                    'monthly_salry_credit'     => 5000.00,
                    'sss_er'                   => 353.30,
                    'sss_ee'                   => 166.70,
                    'sss_total'                => 520.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 363.30,
                    'total_contribution_ee'    => 166.70,
                    'total_contribution_total' => 530.00
                ],
                [
                    'range_compensation_from'  => 5250.00,
                    'range_compensation_to'    => 5749.99,
                    'monthly_salry_credit'     => 5500.00,
                    'sss_er'                   => 388.70,
                    'sss_ee'                   => 183.30,
                    'sss_total'                => 572.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 398.70,
                    'total_contribution_ee'    => 183.30,
                    'total_contribution_total' => 582.00
                ],
                [
                    'range_compensation_from'  => 5750.00,
                    'range_compensation_to'    => 6249.99,
                    'monthly_salry_credit'     => 6000.00,
                    'sss_er'                   => 424.00,
                    'sss_ee'                   => 200.00,
                    'sss_total'                => 624.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 434.00,
                    'total_contribution_ee'    => 200.00,
                    'total_contribution_total' => 634.00
                ],
                [
                    'range_compensation_from'  => 6250.00,
                    'range_compensation_to'    => 6749.99,
                    'monthly_salry_credit'     => 6500.00,
                    'sss_er'                   => 459.30,
                    'sss_ee'                   => 216.70,
                    'sss_total'                => 676.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 469.30,
                    'total_contribution_ee'    => 216.70,
                    'total_contribution_total' => 686.00
                ],
                [
                    'range_compensation_from'  => 6750.00,
                    'range_compensation_to'    => 7249.99,
                    'monthly_salry_credit'     => 7000.00,
                    'sss_er'                   => 494.70,
                    'sss_ee'                   => 233.30,
                    'sss_total'                => 728.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 504.70,
                    'total_contribution_ee'    => 233.30,
                    'total_contribution_total' => 738.00
                ],
                [
                    'range_compensation_from'  => 7250.00,
                    'range_compensation_to'    => 7749.99,
                    'monthly_salry_credit'     => 7500.00,
                    'sss_er'                   => 530.00,
                    'sss_ee'                   => 250.00,
                    'sss_total'                => 780.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 540.00,
                    'total_contribution_ee'    => 250.00,
                    'total_contribution_total' => 790.00
                ],
                [
                    'range_compensation_from'  => 7750.00,
                    'range_compensation_to'    => 8249.99,
                    'monthly_salry_credit'     => 8000.00,
                    'sss_er'                   => 565.30,
                    'sss_ee'                   => 266.70,
                    'sss_total'                => 832.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 575.30,
                    'total_contribution_ee'    => 266.70,
                    'total_contribution_total' => 842.00
                ],
                [
                    'range_compensation_from'  => 8250.00,
                    'range_compensation_to'    => 8749.99,
                    'monthly_salry_credit'     => 8500.00,
                    'sss_er'                   => 600.70,
                    'sss_ee'                   => 283.30,
                    'sss_total'                => 884.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 610.70,
                    'total_contribution_ee'    => 283.30,
                    'total_contribution_total' => 894.00
                ],
                [
                    'range_compensation_from'  => 8750.00,
                    'range_compensation_to'    => 9249.99,
                    'monthly_salry_credit'     => 9000.00,
                    'sss_er'                   => 636.00,
                    'sss_ee'                   => 300.00,
                    'sss_total'                => 936.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 646.00,
                    'total_contribution_ee'    => 300.00,
                    'total_contribution_total' => 946.00
                ],
                [
                    'range_compensation_from'  => 9250.00,
                    'range_compensation_to'    => 9749.99,
                    'monthly_salry_credit'     => 9500.00,
                    'sss_er'                   => 671.30,
                    'sss_ee'                   => 316.70,
                    'sss_total'                => 988.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 681.30,
                    'total_contribution_ee'    => 316.70,
                    'total_contribution_total' => 998.00
                ],
                [
                    'range_compensation_from'  => 9750.00,
                    'range_compensation_to'    => 10249.99,
                    'monthly_salry_credit'     => 10000.00,
                    'sss_er'                   => 706.70,
                    'sss_ee'                   => 333.30,
                    'sss_total'                => 1040.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 716.70,
                    'total_contribution_ee'    => 333.30,
                    'total_contribution_total' => 1050.00
                ],
                [
                    'range_compensation_from'  => 10250.00,
                    'range_compensation_to'    => 10749.99,
                    'monthly_salry_credit'     => 10500.00,
                    'sss_er'                   => 742.00,
                    'sss_ee'                   => 350.00,
                    'sss_total'                => 1092.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 752.00,
                    'total_contribution_ee'    => 350.00,
                    'total_contribution_total' => 1102.00
                ],
                [
                    'range_compensation_from'  => 10750.00,
                    'range_compensation_to'    => 11249.99,
                    'monthly_salry_credit'     => 11000.00,
                    'sss_er'                   => 810.30,
                    'sss_ee'                   => 399.70,
                    'sss_total'                => 1210.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 820.30,
                    'total_contribution_ee'    => 399.70,
                    'total_contribution_total' => 1220.00,
                ],
                [
                    'range_compensation_from'  => 11250.00,
                    'range_compensation_to'    => 11749.99,
                    'monthly_salry_credit'     => 11500.00,
                    'sss_er'                   => 847.20,
                    'sss_ee'                   => 417.80,
                    'sss_total'                => 1265.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 857.20,
                    'total_contribution_ee'    => 417.80,
                    'total_contribution_total' => 1275.00,
                ],
                [
                    'range_compensation_from'  => 11750.00,
                    'range_compensation_to'    => 12249.99,
                    'monthly_salry_credit'     => 12000.00,
                    'sss_er'                   => 884.00,
                    'sss_ee'                   => 436.00,
                    'sss_total'                => 1320.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 894.00,
                    'total_contribution_ee'    => 436.00,
                    'total_contribution_total' => 1330.00,
                ],
                [
                    'range_compensation_from'  => 12250.00,
                    'range_compensation_to'    => 12749.99,
                    'monthly_salry_credit'     => 12500.00,
                    'sss_er'                   => 920.80,
                    'sss_ee'                   => 454.20,
                    'sss_total'                => 1375.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 930.80,
                    'total_contribution_ee'    => 454.20,
                    'total_contribution_total' => 1385.00,
                ],
                [
                    'range_compensation_from'  => 12750.00,
                    'range_compensation_to'    => 13249.99,
                    'monthly_salry_credit'     => 13000.00,
                    'sss_er'                   => 957.70,
                    'sss_ee'                   => 472.30,
                    'sss_total'                => 1430.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 967.70,
                    'total_contribution_ee'    => 472.30,
                    'total_contribution_total' => 1440.00,
                ],
                [
                    'range_compensation_from'  => 13250.00,
                    'range_compensation_to'    => 13749.99,
                    'monthly_salry_credit'     => 13500.00,
                    'sss_er'                   => 994.50,
                    'sss_ee'                   => 490.50,
                    'sss_total'                => 1485.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 1004.50,
                    'total_contribution_ee'    => 490.50,
                    'total_contribution_total' => 1495.00,
                ],
                [
                    'range_compensation_from'  => 13750.00,
                    'range_compensation_to'    => 14249.99,
                    'monthly_salry_credit'     => 14000.00,
                    'sss_er'                   => 1031.30,
                    'sss_ee'                   => 508.70,
                    'sss_total'                => 1540.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 1041.30,
                    'total_contribution_ee'    => 508.70,
                    'total_contribution_total' => 1550.00,
                ],
                [
                    'range_compensation_from'  => 14250.00,
                    'range_compensation_to'    => 14749.99,
                    'monthly_salry_credit'     => 14500.00,
                    'sss_er'                   => 1068.20,
                    'sss_ee'                   => 526.80,
                    'sss_total'                => 1595.00,
                    'ec_er'                    => 10.00,
                    'total_contribution_er'    => 1078.20,
                    'total_contribution_ee'    => 526.80,
                    'total_contribution_total' => 1605.00,
                ],
                [
                    'range_compensation_from'  => 14750.00,
                    'range_compensation_to'    => 15249.99,
                    'monthly_salry_credit'     => 15000.00,
                    'sss_er'                   => 1105.00,
                    'sss_ee'                   => 545.00,
                    'sss_total'                => 1650.00,
                    'ec_er'                    => 30.00,
                    'total_contribution_er'    => 1135.00,
                    'total_contribution_ee'    => 545.00,
                    'total_contribution_total' => 1680.00,
                ],
                [
                    'range_compensation_from'  => 15250.00,
                    'range_compensation_to'    => 15749.99,
                    'monthly_salry_credit'     => 15500.00,
                    'sss_er'                   => 1141.80,
                    'sss_ee'                   => 563.20,
                    'sss_total'                => 1705.00,
                    'ec_er'                    => 30.00,
                    'total_contribution_er'    => 1171.80,
                    'total_contribution_ee'    => 563.20,
                    'total_contribution_total' => 1735.00,
                ],
                [
                    'range_compensation_from'  => 15750.00,
                    'range_compensation_to'    => 16000.00,
                    'monthly_salry_credit'     => 16000.00,
                    'sss_er'                   => 1178.70,
                    'sss_ee'                   => 581.30,
                    'sss_total'                => 1760.00,
                    'ec_er'                    => 30.00,
                    'total_contribution_er'    => 1208.70,
                    'total_contribution_ee'    => 581.30,
                    'total_contribution_total' => 1790.00
                ],
            ]
        );
    }
}
