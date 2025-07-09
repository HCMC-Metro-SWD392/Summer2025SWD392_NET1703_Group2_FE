import React, { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Button, Select, message, Space, Typography, Table } from 'antd';
import { MetroLineApi } from '../../../../api/metroLine/MetroLineApi';
import { StationApi } from '../../../../api/station/StationApi';
import { MetroLineStationApi } from '../../../../api/metroLine/MetroLineStationApi';
import type { CreateMetroLineStationDTO } from '../../../../api/metroLine/MetroLineStationInterface';
import type { GetMetroLineDTO } from '../../../../api/metroLine/MetroLineInterface';
import type { GetStationDTO } from '../../../../api/station/StationInterface';
import { useNavigate } from 'react-router-dom';
import type { SortOrder } from 'antd/es/table/interface';

const { Title } = Typography;
const { Option } = Select;

const AddMetroLineStation: React.FC = () => {
  const [form] = Form.useForm();
  const [metroLines, setMetroLines] = useState<GetMetroLineDTO[]>([]);
  const [stations, setStations] = useState<GetStationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [usedDistances, setUsedDistances] = useState<number[]>([]);
  const [metroLineStations, setMetroLineStations] = useState<any[]>([]);
  const [usedStationIds, setUsedStationIds] = useState<string[]>([]);
  const [usedOrders, setUsedOrders] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMetroLines();
    fetchStations();
  }, []);

  const fetchMetroLines = async () => {
    try {
      const response = await MetroLineApi.getAllMetroLines();
      if (response.isSuccess && response.result) {
        setMetroLines(response.result);
      } else {
        message.error(response.message || 'Không thể tải danh sách tuyến Metro');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải danh sách tuyến Metro');
    }
  };

  const fetchStations = async () => {
    try {
      const response = await StationApi.getAllStations();
      if (response.isSuccess && response.result) {
        setStations(response.result);
      } else {
        message.error(response.message || 'Không thể tải danh sách trạm');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải danh sách trạm');
    }
  };

  const handleMetroLineChange = async (metroLineId: string) => {
    form.setFieldsValue({ metroLineId });
    const response = await MetroLineApi.getMetroLineById(metroLineId);
    if (response.isSuccess && response.result) {
      const distances = response.result.metroLineStations.map((s: any) => s.distanceFromStart);
      setUsedDistances(distances);
      setMetroLineStations(response.result.metroLineStations);
      setUsedStationIds(response.result.metroLineStations.map((s: any) => s.station.id));
      setUsedOrders(response.result.metroLineStations.map((s: any) => s.stationOrder));
    } else {
      setUsedDistances([]);
      setMetroLineStations([]);
      setUsedStationIds([]);
      setUsedOrders([]);
    }
  };

  const handleSubmit = async (values: any) => {
    const data: CreateMetroLineStationDTO = {
      metroLineId: values.metroLineId,
      stationId: values.stationId,
      distanceFromStart: values.distanceFromStart,
      stationOder: values.stationOder,
    };
    setLoading(true);
    try {
      const response = await MetroLineStationApi.createMetroLineStation(data);
      if (response.isSuccess) {
        message.success('Thêm trạm vào tuyến thành công!');
        const metroLineId = form.getFieldValue('metroLineId');
        if (metroLineId) {
          await handleMetroLineChange(metroLineId);
        }
        form.resetFields();
      } else {
        message.error(response.message || 'Không thể thêm trạm vào tuyến');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm trạm vào tuyến');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Thứ Tự',
      dataIndex: 'stationOrder',
      key: 'stationOrder',
      width: 80,
      align: 'center' as const,
      sorter: (a: any, b: any) => a.stationOrder - b.stationOrder,
      defaultSortOrder: 'ascend' as SortOrder,
    },
    {
      title: 'Tên Trạm',
      dataIndex: ['station', 'name'],
      key: 'stationName',
      render: (_: any, record: any) => record.station?.name || 'N/A',
    },
    {
      title: 'Khoảng Cách (km)',
      dataIndex: 'distanceFromStart',
      key: 'distanceFromStart',
      align: 'right' as const,
      render: (distance: number) => distance?.toFixed(2),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Title level={2}>Thêm Trạm Vào Tuyến Metro</Title>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="metroLineId"
            label="Chọn Tuyến Metro"
            rules={[{ required: true, message: 'Vui lòng chọn tuyến Metro' }]}
          >
            <Select
              showSearch
              placeholder="Chọn tuyến Metro"
              optionFilterProp="children"
              onChange={handleMetroLineChange}
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {metroLines.map(line => (
                <Option key={line.id} value={line.id} label={`Tuyến ${line.metroLineNumber} - ${line.metroName || 'Chưa đặt tên'}`}>
                  {`Tuyến ${line.metroLineNumber} - ${line.metroName || 'Chưa đặt tên'}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="stationId"
            label="Chọn Trạm"
            rules={[
              { required: true, message: 'Vui lòng chọn trạm' },
              {
                validator: (_, value) => {
                  if (usedStationIds.includes(value)) {
                    return Promise.reject('Trạm này đã tồn tại trong tuyến!');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Select
              showSearch
              placeholder="Chọn trạm"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {stations.map(station => (
                <Option key={station.id} value={station.id} label={station.name}>
                  {station.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="distanceFromStart"
            label="Khoảng Cách Từ Đầu Tuyến (km)"
            rules={[
              { required: true, message: 'Vui lòng nhập khoảng cách' },
              {
                validator: (_, value) => {
                  if (usedDistances.includes(value)) {
                    return Promise.reject('Khoảng cách này đã tồn tại cho tuyến này!');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="Nhập khoảng cách"
              onBlur={e => {
                const value = e.target.value;
                if (value && /^\d+\.\d$/.test(value)) {
                  // Nếu chỉ có 1 số thập phân, tự động thêm 0
                  e.target.value = parseFloat(value).toFixed(2);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="stationOder"
            label="Thứ Tự Trạm"
            rules={[
              { required: true, message: 'Vui lòng nhập thứ tự trạm' },
              {
                validator: (_, value) => {
                  if (usedOrders.includes(value)) {
                    return Promise.reject('Thứ tự trạm này đã tồn tại trong tuyến!');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber min={1} step={1} style={{ width: '100%' }} placeholder="Nhập thứ tự trạm" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => navigate(-1)}>
                Quay lại
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Thêm Trạm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      {metroLineStations.length > 0 && (
        <Card title="Danh Sách Trạm Của Tuyến Đã Chọn" style={{ marginTop: 24 }}>
          <Table
            columns={columns}
            dataSource={metroLineStations}
            rowKey="id"
            pagination={false}
            size="small"
            locale={{ emptyText: 'Chưa có trạm nào cho tuyến này' }}
          />
        </Card>
      )}
    </Space>
  );
};

export default AddMetroLineStation;
