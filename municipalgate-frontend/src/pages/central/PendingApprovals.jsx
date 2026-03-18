export default function PendingApprovals() {
  const [resources, setResources] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchPendingResources(token).then(setResources);
  }, []);

  const handleApprove = async (resourceId) => {
    await publishResource(token, resourceId);
    setResources(prev => prev.filter(r => r.id !== resourceId));
    showToast("Resource published successfully");
  };

  const handleReject = async (resourceId, reason) => {
    // Note: You may need to add a reject endpoint for resources
    // For now, update status to ARCHIVED or add a new service method
    await archiveResource(token, resourceId, reason);
    setResources(prev => prev.filter(r => r.id !== resourceId));
    showToast("Resource rejected");
  };

  return (
    <div>
      <h2>Pending Resource Approvals</h2>
      <Table 
        data={resources}
        columns={[
          { key: 'title', label: 'Resource' },
          { key: 'municipality.name', label: 'Municipality' },
          { key: 'createdBy.name', label: 'Submitted By' },
          { key: 'createdAt', label: 'Submitted', format: formatDate }
        ]}
        actions={(resource) => (
          <>
            <button onClick={() => setSelected(resource)}>View</button>
            <button onClick={() => handleApprove(resource.id)}>✓ Approve</button>
            <button onClick={() => {
              const reason = prompt("Rejection reason:");
              if (reason) handleReject(resource.id, reason);
            }}>✗ Reject</button>
          </>
        )}
      />
      
      {/* Modal for resource details */}
      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <ResourcePreview resource={selected} />
        </Modal>
      )}
    </div>
  );
}