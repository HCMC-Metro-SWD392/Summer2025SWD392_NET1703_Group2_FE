import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, message, Spin, Input } from 'antd';
import { StaffScheduleApi } from '../../../../api/manageStaff/staffSchedule/StaffScheduleApi';
import { ManageStaffApi } from '../../../../api/manageStaff/manageStaffApi';
import { StationApi } from '../../../../api/station/StationApi';
import { StaffShiftApi } from '../../../../api/manageStaff/staffShift/staffShiftApi';

const AssignStaffSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [form] = Form.useForm();
  const [stationSearch, setStationSearch] = useState('');

  useEffect(() => {
    fetchSchedules();
    fetchStaffs();
    fetchStations();
    fetchShifts();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // Always get the current date when this function is called
      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = '2100-12-31';
      const response = await StaffScheduleApi.getAllSchedules(startDate, endDate);
      if (response.isSuccess && Array.isArray(response.result)) {
        setSchedules(response.result);
      } else {
        setSchedules([]);
      }
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffs = async () => {
    try {
      const response = await ManageStaffApi.getAllStaff();
      if (response.isSuccess && Array.isArray(response.result)) {
        setStaffs(response.result);
      } else {
        setStaffs([]);
      }
    } catch {
      setStaffs([]);
    }
  };

  const fetchStations = async () => {
    try {
      const response = await StationApi.getAllStations();
      if (response.isSuccess && Array.isArray(response.result)) {
        setStations(response.result);
      } else {
        setStations([]);
      }
    } catch {
      setStations([]);
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await StaffShiftApi.getAllStaffShifts();
      if (Array.isArray(response)) {
        setShifts(response);
      } else {
        setShifts([]);
      }
    } catch {
      setShifts([]);
    }
  };

  const openAssignModal = (schedule: any) => {
    setSelectedSchedule(schedule);
    setAssignModalVisible(true);
    form.resetFields();
    if (schedule.staffId) {
      form.setFieldsValue({ staffId: schedule.staffId });
    }
    if (schedule.stationId) {
      form.setFieldsValue({ workingStationId: schedule.stationId });
    }
    if (schedule.shiftId) {
      form.setFieldsValue({ shiftId: schedule.shiftId });
    }
  };

  const handleAssign = async (values: any) => {
    setLoading(true);
    try {
      const res = await StaffScheduleApi.assignStaff(
        values.staffId,
        values.shiftId,
        selectedSchedule.id,
        values.workingStationId
      );
      if (res.isSuccess) {
        message.success('Gán nhân viên vào lịch thành công');
        setAssignModalVisible(false);
        setSelectedSchedule(null);
        // Move the updated schedule to the top
        setSchedules(prev => {
          const updated = prev.find(sch => sch.id === selectedSchedule.id);
          const others = prev.filter(sch => sch.id !== selectedSchedule.id);
          if (updated) {
            // Optionally update staffFullName, staffId, stationId, etc. if needed
            updated.staffId = values.staffId;
            const staff = staffs.find(s => s.id === values.staffId);
            if (staff) updated.staffFullName = staff.fullName;
            updated.stationId = values.workingStationId;
            const station = stations.find(s => s.id === values.workingStationId);
            if (station) updated.stationName = station.name;
            updated.shiftId = values.shiftId;
            const shift = shifts.find(s => s.id === values.shiftId);
            if (shift) updated.shiftName = shift.shiftName;
            return [updated, ...others];
          }
          return prev;
        });
      } else {
        message.error(res.message || 'Gán nhân viên vào lịch thất bại');
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gán nhân viên vào lịch thất bại');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Tên Ca', dataIndex: 'shiftName', key: 'shiftName' },
    { title: 'Nhân Viên', dataIndex: 'staffFullName', key: 'staffFullName' },
    { 
      title: 'Ga', 
      dataIndex: 'stationName', 
      key: 'stationName',
      render: (text: string | null) => text || <span style={{ color: '#aaa' }}>Chưa có</span>
    },
    { title: 'Ngày Làm Việc', dataIndex: 'workingDate', key: 'workingDate' },
    { title: 'Giờ Bắt Đầu', dataIndex: 'startTime', key: 'startTime' },
    { title: 'Giờ Tan Ca', dataIndex: 'endTime', key: 'endTime' },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_: any, record: any) => {
        const isPast = isScheduleInPast(record);
        return (
          <Button 
            type="primary" 
            onClick={() => openAssignModal(record)}
            disabled={isPast}
            title={isPast ? 'Không thể thay đổi ca đã qua' : ''}
          >
            Đổi Ca
          </Button>
        );
      },
    },
  ];

  const filteredSchedules = schedules.filter(sch =>
    (sch.stationName || '').toLowerCase().includes(stationSearch.toLowerCase())
  );

  // Check if schedule is in the past
  const isScheduleInPast = (schedule: any) => {
    const now = new Date();
    const workingDate = new Date(schedule.workingDate);
    const startTime = schedule.startTime;
    
    // Create a datetime object for the schedule start
    const scheduleDateTime = new Date(workingDate);
    const [hours, minutes] = startTime.split(':').map(Number);
    scheduleDateTime.setHours(hours, minutes, 0, 0);
    
    return scheduleDateTime < now;
  };

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 1200 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên ga"
            value={stationSearch}
            onChange={e => setStationSearch(e.target.value)}
            style={{ maxWidth: 300, marginBottom: 16 }}
            allowClear
          />
          <Table
            columns={columns}
            dataSource={filteredSchedules}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>
      <Modal
        title="Gán Nhân Viên vào Lịch Làm Việc"
        open={assignModalVisible}
        onCancel={() => setAssignModalVisible(false)}
        onOk={() => form.submit()}
        okText="Gán"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssign}
        >
          <Form.Item
            label="Nhân viên"
            name="staffId"
            rules={[{ required: true, message: 'Chọn nhân viên' }]}
          >
            <Select showSearch placeholder="Chọn nhân viên">
              {staffs.map(staff => (
                <Select.Option key={staff.id} value={staff.id}>
                  {staff.fullName} ({staff.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Ca làm việc"
            name="shiftId"
            rules={[{ required: true, message: 'Chọn ca làm việc' }]}
          >
            <Select showSearch placeholder="Chọn ca làm việc">
              {shifts.map(shift => (
                <Select.Option key={shift.id} value={shift.id}>
                  {shift.shiftName} ({shift.startTime} - {shift.endTime})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Ga làm việc"
            name="workingStationId"
            // Remove required rule if station is optional, otherwise keep as is
            rules={[]}
          >
            <Select showSearch placeholder="Chọn ga làm việc (có thể bỏ trống)">
              {stations.map(station => (
                <Select.Option key={station.id} value={station.id}>
                  {station.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

export default AssignStaffSchedule;
