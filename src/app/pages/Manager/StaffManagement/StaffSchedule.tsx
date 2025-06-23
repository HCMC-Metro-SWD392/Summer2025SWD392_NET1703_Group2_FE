import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, Input, message, Spin, TimePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { StaffScheduleApi } from '../../../../api/manageStaff/staffSchedule/StaffScheduleApi';
import { StaffShiftApi } from '../../../../api/manageStaff/staffShift/staffShiftApi';
import { ManageStaffApi } from '../../../../api/manageStaff/manageStaffApi';
import { StationApi } from '../../../../api/station/StationApi';
import type { CreateStaffScheduleDTO, GetScheduleDTO } from '../../../../api/manageStaff/staffSchedule/StaffScheduleInterface';
import type { StaffShift } from '../../../../api/manageStaff/staffShift/staffShiftInterface';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

const StaffSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<GetScheduleDTO[]>([]);
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [dropdownLoading, setDropdownLoading] = useState({ staff: false, station: false });
  const [stationIdForQuery, setStationIdForQuery] = useState<string | undefined>(undefined);
  const [dateForStationQuery, setDateForStationQuery] = useState<Dayjs | null>(null);
  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [shiftForm] = Form.useForm();

  useEffect(() => {
    fetchShifts();
    fetchStaffs();
    fetchStations();
  }, []);

  const fetchSchedules = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const response = await StaffScheduleApi.getAllSchedules(startDate, endDate);
      if (response.isSuccess && response.result) {
        setSchedules(response.result);
      } else {
        setSchedules([]);
        message.error(response.message || 'Failed to fetch schedules');
      }
    } catch (error) {
      setSchedules([]);
      message.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchShifts = async () => {
    try {
      const result = await StaffShiftApi.getAllStaffShifts();
      if (Array.isArray(result)) {
        setShifts(result);
      } else {
        setShifts([]);
      }
    } catch (error) {
      setShifts([]);
      message.error('Failed to fetch staff shifts');
    }
  };

  const fetchStaffs = async () => {
    setDropdownLoading((prev) => ({ ...prev, staff: true }));
    try {
      const response = await ManageStaffApi.getAllStaff();
      if (response.isSuccess && Array.isArray(response.result?.items)) {
        setStaffs(response.result.items);
      } else if (Array.isArray(response.result)) {
        setStaffs(response.result);
      } else {
        setStaffs([]);
      }
    } catch (error) {
      setStaffs([]);
      message.error('Failed to fetch staff');
    } finally {
      setDropdownLoading((prev) => ({ ...prev, staff: false }));
    }
  };

  const fetchStations = async () => {
    setDropdownLoading((prev) => ({ ...prev, station: true }));
    try {
      const response = await StationApi.getAllStations();
      if (response.isSuccess && Array.isArray(response.result)) {
        setStations(response.result);
      } else {
        setStations([]);
      }
    } catch (error) {
      setStations([]);
      message.error('Failed to fetch stations');
    } finally {
      setDropdownLoading((prev) => ({ ...prev, station: false }));
    }
  };

  const handleCreate = async (values: any) => {
    const data: CreateStaffScheduleDTO = {
      staffId: values.StaffId,
      shiftId: values.ShiftId,
      workingDate: values.WorkingDate.format('YYYY-MM-DD'),
      workingStationId: values.WorkingStationId,
    };
    try {
      const response = await StaffScheduleApi.createStaffSchedule(data);
      if (response.isSuccess) {
        message.success('Staff schedule created successfully');
        setModalVisible(false);
        form.resetFields();
        if (dateRange[0] && dateRange[1]) {
          const startDate = dateRange[0].format('YYYY-MM-DD');
          const endDate = dateRange[1].format('YYYY-MM-DD');
          fetchSchedules(startDate, endDate);
        }
      } else {
        message.error(response.message || 'Failed to create staff schedule');
      }
    } catch (error) {
      message.error('Failed to create staff schedule');
    }
  };

  const handleLoadSchedules = () => {
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      fetchSchedules(startDate, endDate);
    } else {
      message.warning('Hãy Chọn Thời Gian Trước');
    }
  };

  const handleLoadSchedulesByStationAndDate = async () => {
    if (!stationIdForQuery || !dateForStationQuery) {
      message.warning('Hãy Chọn Một Ga Và Ngày');
      return;
    }
    setLoading(true);
    try {
      const response = await StaffScheduleApi.getSchedulesByStationIdAndDate(
        stationIdForQuery,
        dateForStationQuery.format('YYYY-MM-DD')
      );
      if (response.isSuccess && response.result) {
        setSchedules(response.result);
      } else {
        setSchedules([]);
        message.error(response.message || 'Failed to fetch schedules by station and date');
      }
    } catch (error) {
      setSchedules([]);
      message.error('Failed to fetch schedules by station and date');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (values: any) => {
    try {
      const data = {
        shiftName: values.shiftName,
        startTime: values.startTime.format('HH:mm:ss'),
        endTime: values.endTime.format('HH:mm:ss'),
      };
      await StaffShiftApi.createStaffShift(data);
      message.success('Staff shift created successfully');
      setShiftModalVisible(false);
      shiftForm.resetFields();
      fetchShifts(); // Refresh shifts for schedule creation
    } catch (error) {
      message.error('Failed to create staff shift');
    }
  };

  const columns: ColumnsType<GetScheduleDTO> = [
    {
      title: 'Nhân Viên',
      dataIndex: ['staff', 'fullName'],
      key: 'staff',
      render: (_: any, record) => record.staff?.fullName || '',
    },
    {
      title: 'Ca Làm',
      dataIndex: ['shift', 'shiftName'],
      key: 'shift',
      render: (_: any, record) => record.shift?.shiftName || '',
    },
    {
      title: 'Ngày Làm',
      dataIndex: 'workingDate',
      key: 'workingDate',
    },
    {
      title: 'Ga',
      dataIndex: ['workingStation', 'name'],
      key: 'station',
      render: (_: any, record) => record.workingStation?.name || '',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        switch (status) {
          case 0: return 'Bình Thường';
          case 1: return 'Tan Ca';
          case 2: return 'Vắng';
          default: return '';
        }
      },
    },
  ];

  return (
    <div className="w-full h-full p-2 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Lịch Làm Việc</h1>
        <div className="flex gap-2">
          <Button type="primary" onClick={() => setModalVisible(true)}>
            Tạo Lịch Làm Việc
          </Button>
          <Button type="primary" onClick={() => setShiftModalVisible(true)}>
            Tạo Ca Làm Việc
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
        <RangePicker
          value={dateRange}
          onChange={(values) => setDateRange(values as [Dayjs | null, Dayjs | null])}
          allowClear
        />
        <Button type="primary" onClick={handleLoadSchedules}>
          Tìm Lịch Làm Việc
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
        <Select
          placeholder="Select station for query"
          style={{ minWidth: 200 }}
          value={stationIdForQuery}
          onChange={setStationIdForQuery}
          loading={dropdownLoading.station}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            !!option?.children && option.children.toString().toLowerCase().includes(input.toLowerCase())
          }
        >
          {stations.map(station => (
            <Select.Option key={station.id} value={station.id}>
              {station.name}
            </Select.Option>
          ))}
        </Select>
        <DatePicker
          value={dateForStationQuery}
          onChange={setDateForStationQuery}
          placeholder="Select date for query"
        />
        <Button type="primary" onClick={handleLoadSchedulesByStationAndDate}>
          Tìm Lịch Làm Việc Theo Ga và Ngày
        </Button>
      </div>
      <div className="w-full overflow-hidden">
        <Table
          columns={columns}
          dataSource={schedules}
          rowKey="Id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          className="w-full"
          size="middle"
        />
      </div>
      <Modal
        title="Tạo Lịch Làm Việc"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Create"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            label="Nhân Viên"
            name="StaffId"
            rules={[{ required: true, message: 'Hãy Chọn Nhân Viên' }]}
          >
            <Select
              placeholder="Chọn Nhân Viên"
              loading={dropdownLoading.staff}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                !!option?.children && option.children.toString().toLowerCase().includes(input.toLowerCase())
              }
            >
              {staffs.map(staff => (
                <Select.Option key={staff.id} value={staff.id}>
                  {staff.fullName} ({staff.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Ca"
            name="ShiftId"
            rules={[{ required: true, message: 'Chọn Ca Làm Việc' }]}
          >
            <Select placeholder="Chọn Ca Làm Việc">
              {shifts.map(shift => (
                <Select.Option key={shift.id} value={shift.id}>
                  {shift.shiftName} ({shift.startTime} - {shift.endTime})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Ngày Làm Việc"
            name="WorkingDate"
            rules={[{ required: true, message: 'Hãy Chọn Ngày Làm Việc' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Chọn Ga Làm Việc"
            name="WorkingStationId"
            rules={[{ required: true, message: 'Hãy Chọn Ca Làm Việc' }]}
          >
            <Select
              placeholder="Chọn Ca Làm Việc"
              loading={dropdownLoading.station}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                !!option?.children && option.children.toString().toLowerCase().includes(input.toLowerCase())
              }
            >
              {stations.map(station => (
                <Select.Option key={station.id} value={station.id}>
                  {station.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Tạo Ca Làm Việc"
        open={shiftModalVisible}
        onCancel={() => setShiftModalVisible(false)}
        onOk={() => shiftForm.submit()}
        okText="Create"
      >
        <Form
          form={shiftForm}
          layout="vertical"
          onFinish={handleCreateShift}
        >
          <Form.Item
            label="Tên Ca"
            name="shiftName"
            rules={[{ required: true, message: 'Hãy Nhập Tên Ca' }]}
          >
            <Input placeholder="Enter shift name" />
          </Form.Item>
          <Form.Item
            label="Giờ Bắt Đầu"
            name="startTime"
            rules={[{ required: true, message: 'Hãy Chọn Thời Gian Bắt Đầu' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Giờ Tan Ca"
            name="endTime"
            rules={[{ required: true, message: 'Hãy Chọn Thời Gian Tan Ca' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffSchedule;
